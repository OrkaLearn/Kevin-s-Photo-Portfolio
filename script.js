/* Kevin Chai — Photography Portfolio
   Lightbox: click to open, arrows / keyboard to navigate, Esc to close.
   Pagination: only the first batch of gallery items stays in the DOM;
   "Load more" re-attaches the next batch. Year headers (no data-lightbox)
   count in pagination but are excluded from the lightbox. */

(function () {
  "use strict";

  var PAGE_SIZE = 24;

  var gallery = document.querySelector(".gallery");
  var lightbox = document.querySelector(".lightbox");
  var loadMoreBtn = document.querySelector(".load-more");
  var loadMoreRow = document.querySelector(".load-more-row");

  if (!gallery || !lightbox) return;

  var figure = lightbox.querySelector(".lightbox-figure img");
  var counter = lightbox.querySelector(".lightbox-counter");
  var prevBtn = lightbox.querySelector(".lightbox-prev");
  var nextBtn = lightbox.querySelector(".lightbox-next");
  var closeBtn = lightbox.querySelector(".lightbox-close");

  /* Snapshot all gallery children (photo buttons + year headers). */

  var items = Array.prototype.slice.call(gallery.children).map(function (el) {
    if (!el.hasAttribute("data-lightbox")) {
      return { el: el, header: true };
    }
    var img = el.querySelector("img");
    var dateEl = el.querySelector(".photo-date");
    return {
      el: el,
      header: false,
      full: img.getAttribute("data-full") || img.getAttribute("src"),
      alt: img.alt,
      date: dateEl ? dateEl.textContent : ""
    };
  });

  if (!items.length) return;

  var rendered = Math.min(PAGE_SIZE, items.length);
  items.forEach(function (item, i) {
    if (i >= rendered) item.el.remove();
  });

  var photos = items.filter(function (item) {
    return !item.header;
  });

  var current = 0;
  var lastFocused = null;

  /* ---------- Lightbox ---------- */

  function render() {
    var item = photos[current];
    figure.src = item.full;
    figure.alt = item.alt;
    counter.textContent = (current + 1) + " / " + photos.length + (item.date ? " · " + item.date : "");
  }

  function open(index) {
    current = index;
    lastFocused = document.activeElement;
    render();
    lightbox.classList.add("is-open");
    document.body.classList.add("lightbox-open");
    closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
    figure.src = "";
    if (lastFocused) lastFocused.focus();
  }

  function step(delta) {
    current = (current + delta + photos.length) % photos.length;
    render();
  }

  photos.forEach(function (item, index) {
    item.el.addEventListener("click", function () {
      open(index);
    });
  });

  prevBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    step(-1);
  });

  nextBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    step(1);
  });

  closeBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    close();
  });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  /* ---------- Load more ---------- */

  function updateLoadMore() {
    if (!loadMoreBtn || !loadMoreRow) return;
    var remaining = items.length - rendered;
    if (remaining <= 0) {
      loadMoreRow.hidden = true;
      return;
    }
    loadMoreBtn.textContent = "Load more (" + remaining + " remaining)";
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      var next = Math.min(rendered + PAGE_SIZE, items.length);
      for (var i = rendered; i < next; i++) {
        gallery.appendChild(items[i].el);
      }
      rendered = next;
      updateLoadMore();
    });
    updateLoadMore();
  }
})();
