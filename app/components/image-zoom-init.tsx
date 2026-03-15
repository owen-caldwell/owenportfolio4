"use client";

import { useEffect } from "react";

const ZOOM_OFFSET = 80;

type ZoomState = {
  originalImg: HTMLImageElement;
  cloneImg: HTMLImageElement;
  overlay: HTMLDivElement;
  initialScrollY: number;
  touchStartY: number | null;
} | null;

export default function ImageZoomInit() {
  useEffect(() => {
    let zoomState: ZoomState = null;

    const closeZoom = () => {
      if (!zoomState) return;

      const { originalImg, cloneImg, overlay } = zoomState;

      originalImg.style.visibility = "";
      cloneImg.remove();
      overlay.remove();
      document.body.classList.remove("zoom-overlay-open");

      zoomState = null;
    };

    const openZoom = (img: HTMLImageElement) => {
      const naturalWidth = img.naturalWidth || img.width;
      const naturalHeight = img.naturalHeight || img.height;
      const currentWidth = img.clientWidth || img.width;

      if (!naturalWidth || !naturalHeight || !currentWidth) return;
      if (currentWidth >= window.innerWidth - ZOOM_OFFSET) return;

      closeZoom();

      const overlay = document.createElement("div");
      overlay.className = "zoom-overlay";
      document.body.appendChild(overlay);

      const maxScaleFactor = naturalWidth / currentWidth;
      const viewportHeight = window.innerHeight - ZOOM_OFFSET;
      const viewportWidth = window.innerWidth - ZOOM_OFFSET;
      const imageAspectRatio = naturalWidth / naturalHeight;
      const viewportAspectRatio = viewportWidth / viewportHeight;

      let imgScaleFactor: number;
      if (naturalWidth < viewportWidth && naturalHeight < viewportHeight) {
        imgScaleFactor = maxScaleFactor;
      } else if (imageAspectRatio < viewportAspectRatio) {
        imgScaleFactor = (viewportHeight / naturalHeight) * maxScaleFactor;
      } else {
        imgScaleFactor = (viewportWidth / naturalWidth) * maxScaleFactor;
      }

      const rect = img.getBoundingClientRect();
      const imageCenterX = rect.left + rect.width / 2;
      const imageCenterY = rect.top + rect.height / 2;
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;
      const translateX = viewportCenterX - imageCenterX;
      const translateY = viewportCenterY - imageCenterY;

      const cloneImg = img.cloneNode(true) as HTMLImageElement;
      cloneImg.classList.add("zoom-img");
      cloneImg.style.position = "fixed";
      cloneImg.style.left = `${rect.left}px`;
      cloneImg.style.top = `${rect.top}px`;
      cloneImg.style.width = `${rect.width}px`;
      cloneImg.style.height = `${rect.height}px`;
      cloneImg.style.margin = "0";
      cloneImg.style.maxWidth = "none";
      cloneImg.style.transformOrigin = "center center";
      cloneImg.style.willChange = "transform";
      cloneImg.style.pointerEvents = "none";
      document.body.appendChild(cloneImg);

      img.style.visibility = "hidden";
      cloneImg.getBoundingClientRect();
      cloneImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${imgScaleFactor})`;
      document.body.classList.add("zoom-overlay-open");

      zoomState = {
        originalImg: img,
        cloneImg,
        overlay,
        initialScrollY: window.scrollY,
        touchStartY: null,
      };
    };

    const onClickCapture = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) {
        if (zoomState) {
          event.preventDefault();
          event.stopPropagation();
          closeZoom();
        }
        return;
      }

      const action = target.dataset.action;

      if (zoomState) {
        event.preventDefault();
        event.stopPropagation();
        closeZoom();
        return;
      }

      if (action !== "zoom") return;

      if (event.metaKey || event.ctrlKey) {
        const src = target.currentSrc || target.src;
        if (src) window.open(src, "_blank");
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      openZoom(target);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeZoom();
    };

    const onScroll = () => {
      if (!zoomState) return;
      if (Math.abs(zoomState.initialScrollY - window.scrollY) >= 40) closeZoom();
    };

    const onTouchStart = (event: TouchEvent) => {
      if (!zoomState) return;
      zoomState.touchStartY = event.touches[0]?.pageY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!zoomState || zoomState.touchStartY === null) return;
      const touchY = event.touches[0]?.pageY;
      if (touchY == null) return;
      if (Math.abs(touchY - zoomState.touchStartY) > 10) closeZoom();
    };

    document.addEventListener("click", onClickCapture, true);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("scroll", onScroll);
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      closeZoom();
      document.removeEventListener("click", onClickCapture, true);
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return null;
}
