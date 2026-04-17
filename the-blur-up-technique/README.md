# The ”blur-up” technique

A Pen created on CodePen.

Original URL: [https://codepen.io/thatemil/pen/yYmaqG](https://codepen.io/thatemil/pen/yYmaqG).

This example uses a tiny image inline in the CSS, which is then scaled up and blurred using an SVG filter. This filter actually replicates the `filter()`-function in CSS, by itself inlining the JPEG image inside an SVG wrapper.

A high-res version of the same image is then preloaded using JS (and CSSOM properties to get the URL from inside the CSS, before it is applied) and then finally toggles the class name applying the image. View the example in WebKit nightlies to see the animated effect when the sharper image is animated using the `filter()`-function, which so far is only implemented there.