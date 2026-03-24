+function ($) { "use strict";

  function isLikelyDataUrl(url) {
    return typeof url === 'string' && url.indexOf('data:') === 0
  }

  function getVisibleZoomGalleryScope() {
    var scopes = document.querySelectorAll('[data-zoom-gallery-scope]')
    for (var i = 0; i < scopes.length; i++) {
      var el = scopes[i]
      if (!el.getClientRects().length) continue
      var r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      var style = window.getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden') continue
      return el
    }
    return null
  }

  function collectCarouselItems(clickedThumb) {
    var scope = getVisibleZoomGalleryScope()
    if (scope && scope.contains(clickedThumb)) {
      return Array.prototype.slice.call(
        scope.querySelectorAll('img[data-action="zoom"]')
      )
    }
    return [clickedThumb]
  }

  /**
   * Full-size URL for lazysizes / placeholder thumbnails.
   */
  function getFullImageSrc(img) {
    if (!img) return ''
    var ds = img.getAttribute('data-src')
    if (ds && !isLikelyDataUrl(ds)) return ds
    if (img.currentSrc && !isLikelyDataUrl(img.currentSrc)) return img.currentSrc
    if (img.src && !isLikelyDataUrl(img.src)) return img.src
    return ds || img.currentSrc || img.src || ''
  }

  /**
   * The zoom service
   */
  function ZoomService () {
    this._activeZoom            =
    this._initialScrollPosition =
    this._initialTouchPosition  =
    this._touchMoveListener     = null

    this._$document = $(document)
    this._$window   = $(window)
    this._$body     = $(document.body)

    this._boundClick = $.proxy(this._clickHandler, this)
  }

  ZoomService.prototype.listen = function () {
    this._$body.on('click', '[data-action="zoom"]', $.proxy(this._zoom, this))
  }

  ZoomService.prototype._zoom = function (e) {
    var target = e.target

    if (!target || target.tagName != 'IMG') return

    if (this._$body.hasClass('zoom-overlay-open')) return

    if (e.metaKey || e.ctrlKey) {
      return window.open(
        (e.target.getAttribute('data-original') || getFullImageSrc(e.target)),
        '_blank'
      )
    }

    if (target.width >= ($(window).width() - Zoom.OFFSET)) return

    this._activeZoomClose(true)

    var items = collectCarouselItems(target)
    var index = items.indexOf(target)
    if (index < 0) {
      items = [target]
      index = 0
    }

    this._activeZoom = new Zoom(this, items, index)
    this._activeZoom.zoomImage()

    this._$window.on('scroll.zoom', $.proxy(this._scrollHandler, this))

    this._$document.on('keyup.zoom', $.proxy(this._keyHandler, this))
    this._$document.on('keydown.zoom', $.proxy(this._keydownHandler, this))
    this._$document.on('touchstart.zoom', $.proxy(this._touchStart, this))

    if (document.addEventListener) {
      document.addEventListener('click', this._boundClick, true)
    } else {
      document.attachEvent('onclick', this._boundClick, true)
    }

    if ('bubbles' in e) {
      if (e.bubbles) e.stopPropagation()
    } else {
      e.cancelBubble = true
    }
  }

  ZoomService.prototype._activeZoomClose = function (forceDispose) {
    if (!this._activeZoom) return

    if (forceDispose) {
      this._activeZoom.dispose()
    } else {
      this._activeZoom.close()
    }

    this._$window.off('.zoom')
    this._$document.off('.zoom')

    document.removeEventListener('click', this._boundClick, true)

    this._activeZoom = null
  }

  ZoomService.prototype._scrollHandler = function (e) {
    if (this._initialScrollPosition === null) this._initialScrollPosition = $(window).scrollTop()
    var deltaY = this._initialScrollPosition - $(window).scrollTop()
    if (Math.abs(deltaY) >= 40) this._activeZoomClose()
  }

  ZoomService.prototype._keyHandler = function (e) {
    if (e.keyCode == 27) this._activeZoomClose()
  }

  ZoomService.prototype._keydownHandler = function (e) {
    if (!this._activeZoom) return
    var n = this._activeZoom._items.length
    if (n <= 1) return
    if (e.keyCode === 37) {
      e.preventDefault()
      this._activeZoom.navigate(-1)
    } else if (e.keyCode === 39) {
      e.preventDefault()
      this._activeZoom.navigate(1)
    }
  }

  ZoomService.prototype._clickHandler = function (e) {
    if (e.target && e.target.closest && e.target.closest('.zoom-carousel-nav')) {
      return
    }

    if (e.preventDefault) e.preventDefault()
    else event.returnValue = false

    if ('bubbles' in e) {
      if (e.bubbles) e.stopPropagation()
    } else {
      e.cancelBubble = true
    }

    this._activeZoomClose()
  }

  ZoomService.prototype._touchStart = function (e) {
    this._initialTouchPosition = e.touches[0].pageY
    $(e.target).on('touchmove.zoom', $.proxy(this._touchMove, this))
  }

  ZoomService.prototype._touchMove = function (e) {
    if (Math.abs(e.touches[0].pageY - this._initialTouchPosition) > 10) {
      this._activeZoomClose()
      $(e.target).off('touchmove.zoom')
    }
  }

  /**
   * Detached lightbox zoom: overlay clone only; page thumbnails stay in place.
   */
  function Zoom (service, items, startIndex) {
    this._service             = service
    this._items               = items
    this._index               = startIndex
    this._fullHeight          =
    this._fullWidth           =
    this._overlay             =
    this._targetImageWrap     =
    this._overlayImg          =
    this._carouselNav         =
    this._carouselCounter     =
    this._staticClassTimer    = null

    this._$body = $(document.body)
  }

  Zoom.OFFSET = 80
  Zoom._MAX_WIDTH = 2560
  Zoom._MAX_HEIGHT = 4096

  Zoom.prototype.zoomImage = function () {
    var url = getFullImageSrc(this._items[this._index])
    var loader = new Image()
    loader.onload = $.proxy(function () {
      this._fullHeight = Number(loader.height)
      this._fullWidth = Number(loader.width)
      this._buildDetached()
    }, this)
    loader.onerror = $.proxy(function () {
      this._service._activeZoomClose(true)
    }, this)
    loader.src = url
  }

  Zoom.prototype._buildDetached = function () {
    var thumb = this._items[this._index]
    var rect = thumb.getBoundingClientRect()

    this._targetImageWrap = document.createElement('div')
    this._targetImageWrap.className = 'zoom-img-wrap'

    this._overlayImg = document.createElement('img')
    this._overlayImg.src = getFullImageSrc(thumb)
    this._overlayImg.className = 'zoom-img'
    this._overlayImg.alt = thumb.getAttribute('alt') || ''

    var rw = Math.max(1, rect.width)
    var rh = Math.max(1, rect.height)
    this._overlayImg.style.width = rw + 'px'
    this._overlayImg.style.height = rh + 'px'
    this._overlayImg.style.objectFit = 'contain'

    this._targetImageWrap.appendChild(this._overlayImg)

    this._targetImageWrap.style.position = 'fixed'
    this._targetImageWrap.style.left = rect.left + 'px'
    this._targetImageWrap.style.top = rect.top + 'px'
    this._targetImageWrap.style.width = rw + 'px'
    this._targetImageWrap.style.height = rh + 'px'
    this._targetImageWrap.style.margin = '0'
    this._targetImageWrap.style.padding = '0'
    this._targetImageWrap.style.boxSizing = 'border-box'
    this._targetImageWrap.style.zIndex = '5000'
    this._targetImageWrap.style.pointerEvents = 'auto'

    document.body.appendChild(this._targetImageWrap)

    this._overlay = document.createElement('div')
    this._overlay.className = 'zoom-overlay'

    document.body.appendChild(this._overlay)

    this._calculateZoom()
    this._triggerAnimation()
    this._injectCarouselUi()

    var self = this
    this._staticClassTimer = window.setTimeout(function () {
      self._staticClassTimer = null
      if (self._targetImageWrap) {
        self._targetImageWrap.classList.add('zoom-img-wrap--static')
      }
    }, 320)
  }

  Zoom.prototype._calculateZoom = function () {
    this._overlayImg.offsetWidth

    var originalFullImageWidth  = this._fullWidth
    var originalFullImageHeight = this._fullHeight

    var maxScaleFactor = originalFullImageWidth / this._overlayImg.width

    var viewportHeight = ($(window).height() - Zoom.OFFSET)
    var viewportWidth  = ($(window).width() - Zoom.OFFSET)

    var imageAspectRatio    = originalFullImageWidth / originalFullImageHeight
    var viewportAspectRatio = viewportWidth / viewportHeight

    if (originalFullImageWidth < viewportWidth && originalFullImageHeight < viewportHeight) {
      this._imgScaleFactor = maxScaleFactor
    } else if (imageAspectRatio < viewportAspectRatio) {
      this._imgScaleFactor = (viewportHeight / originalFullImageHeight) * maxScaleFactor
    } else {
      this._imgScaleFactor = (viewportWidth / originalFullImageWidth) * maxScaleFactor
    }
  }

  Zoom.prototype._triggerAnimation = function () {
    this._overlayImg.offsetWidth

    var imageOffset = $(this._overlayImg).offset()
    var scrollTop   = $(window).scrollTop()

    var viewportY = scrollTop + ($(window).height() / 2)
    var viewportX = ($(window).width() / 2)

    var imageCenterY = imageOffset.top + (this._overlayImg.height / 2)
    var imageCenterX = imageOffset.left + (this._overlayImg.width / 2)

    this._translateY = viewportY - imageCenterY
    this._translateX = viewportX - imageCenterX

    var targetTransform = 'scale(' + this._imgScaleFactor + ')'
    var imageWrapTransform = 'translate(' + this._translateX + 'px, ' + this._translateY + 'px)'

    if ($.support.transition) {
      imageWrapTransform += ' translateZ(0)'
    }

    $(this._overlayImg)
      .css({
        '-webkit-transform': targetTransform,
            '-ms-transform': targetTransform,
                'transform': targetTransform
      })

    $(this._targetImageWrap)
      .css({
        '-webkit-transform': imageWrapTransform,
            '-ms-transform': imageWrapTransform,
                'transform': imageWrapTransform
      })

    this._$body.addClass('zoom-overlay-open')
  }

  Zoom.prototype.navigate = function (delta) {
    if (this._items.length <= 1) return
    var n = this._items.length
    var next = (this._index + delta + n) % n
    if (next === this._index) return
    this._index = next
    this._loadCarouselSlide()
  }

  Zoom.prototype._loadCarouselSlide = function () {
    var thumb = this._items[this._index]
    var url = getFullImageSrc(thumb)
    var self = this

    var apply = function () {
      self._fullWidth = self._overlayImg.naturalWidth || self._fullWidth
      self._fullHeight = self._overlayImg.naturalHeight || self._fullHeight
      self._applyCarouselSlideLayout()
    }

    if (self._overlayImg.src === url || self._overlayImg.getAttribute('src') === url) {
      if (self._overlayImg.complete) apply()
      else self._overlayImg.onload = apply
      return
    }

    self._overlayImg.onload = apply
    self._overlayImg.src = url
    self._overlayImg.alt = thumb.getAttribute('alt') || ''
  }

  Zoom.prototype._applyCarouselSlideLayout = function () {
    if (this._targetImageWrap) {
      this._targetImageWrap.classList.add('zoom-img-wrap--static')
    }

    var $img = $(this._overlayImg)
    var $wrap = $(this._targetImageWrap)

    $img.css({
      '-webkit-transform': '',
          '-ms-transform': '',
              'transform': ''
    })

    $wrap.css({
      '-webkit-transform': '',
          '-ms-transform': '',
              'transform': '',
      left: '0',
      top: '0',
      right: '0',
      bottom: '0',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    })

    var vw = $(window).width() - Zoom.OFFSET
    var vh = $(window).height() - Zoom.OFFSET
    var nw = this._fullWidth
    var nh = this._fullHeight
    if (!nw || !nh) return

    var scale = Math.min(vw / nw, vh / nh, 1)
    var w = nw * scale
    var h = nh * scale

    $img.css({
      width: w + 'px',
      height: h + 'px',
      maxWidth: 'none',
      maxHeight: 'none'
    })

    this._updateCarouselCounter()
  }

  Zoom.prototype._injectCarouselUi = function () {
    if (this._items.length <= 1) return

    var nav = document.createElement('div')
    nav.className = 'zoom-carousel-nav'
    nav.setAttribute('role', 'toolbar')

    var prev = document.createElement('button')
    prev.type = 'button'
    prev.className = 'zoom-carousel-nav__btn zoom-carousel-nav__btn--prev'
    prev.setAttribute('aria-label', 'Previous image')
    prev.textContent = '‹'

    var next = document.createElement('button')
    next.type = 'button'
    next.className = 'zoom-carousel-nav__btn zoom-carousel-nav__btn--next'
    next.setAttribute('aria-label', 'Next image')
    next.textContent = '›'

    var counter = document.createElement('span')
    counter.className = 'zoom-carousel-nav__counter'

    var self = this
    prev.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      self.navigate(-1)
    })
    next.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      self.navigate(1)
    })

    nav.appendChild(prev)
    nav.appendChild(counter)
    nav.appendChild(next)
    document.body.appendChild(nav)

    this._carouselNav = nav
    this._carouselCounter = counter
    this._updateCarouselCounter()
  }

  Zoom.prototype._updateCarouselCounter = function () {
    if (!this._carouselCounter) return
    this._carouselCounter.textContent =
      (this._index + 1) + ' / ' + this._items.length
  }

  Zoom.prototype.close = function () {
    if (this._staticClassTimer != null) {
      window.clearTimeout(this._staticClassTimer)
      this._staticClassTimer = null
    }

    var self = this
    var $wrap = $(this._targetImageWrap)
    var $img = $(this._overlayImg)

    $wrap.removeClass('zoom-img-wrap--static')
    if (this._targetImageWrap) {
      void this._targetImageWrap.offsetHeight
    }

    // `zoom-img-wrap--static` used `transition: none !important`. Flush that removal
    // before clearing transforms so the exit animation is not skipped on first close.
    window.requestAnimationFrame(function () {
      self._$body
        .removeClass('zoom-overlay-open')
        .addClass('zoom-overlay-transitioning')

      var transitionCss = {
        '-webkit-transition': '-webkit-transform 300ms ease',
        '-o-transition': '-o-transform 300ms ease',
        transition: 'transform 300ms ease'
      }
      var clearTransforms = {
        '-webkit-transform': '',
            '-ms-transform': '',
                'transform': ''
      }

      $wrap.css($.extend({}, transitionCss, clearTransforms))
      $img.css($.extend({}, transitionCss, clearTransforms))

      if (!$.support.transition) {
        return self.dispose()
      }

      $img
        .one($.support.transition.end, $.proxy(self.dispose, self))
        .emulateTransitionEnd(300)
    })
  }

  Zoom.prototype.dispose = function () {
    if (this._staticClassTimer != null) {
      window.clearTimeout(this._staticClassTimer)
      this._staticClassTimer = null
    }

    if (this._carouselNav && this._carouselNav.parentNode) {
      this._carouselNav.parentNode.removeChild(this._carouselNav)
    }
    this._carouselNav = null
    this._carouselCounter = null

    if (this._targetImageWrap && this._targetImageWrap.parentNode) {
      this._targetImageWrap.parentNode.removeChild(this._targetImageWrap)
    }
    this._targetImageWrap = null
    this._overlayImg = null

    if (this._overlay && this._overlay.parentNode) {
      this._overlay.parentNode.removeChild(this._overlay)
    }
    this._overlay = null

    this._$body.removeClass('zoom-overlay-transitioning')
  }

  $(function () {
    new ZoomService().listen()
  })

}(jQuery)
