(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Fill the shared "head of school" duties lists */
  var tpl = document.getElementById("headDuties");
  if (tpl) {
    document.querySelectorAll('[data-duties="head"]').forEach(function (ul) {
      ul.appendChild(tpl.content.cloneNode(true));
    });
  }


  /* Scroll reveal for cards and headings */
  (function () {
    var els = document.querySelectorAll(".card, .svc, .head, .cta, .about__text > *, .about__media");
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    els.forEach(function (el) {
      el.classList.add("reveal");
      var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty("--d", ((sibs % 4) * 0.09).toFixed(2) + "s");
    });
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { ro.observe(el); });
  })();

  /* Mobile navigation */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Highlight current section in the nav */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));
  var targets = navAnchors.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navAnchors.forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    targets.forEach(function (t) { if (t) io.observe(t); });
  }

  /* Employment accordion: one row open at a time */
  var list = document.getElementById("svcList");
  if (list) {
    list.addEventListener("click", function (e) {
      var btn = e.target.closest(".svc__head");
      if (!btn) return;
      var item = btn.parentElement;
      var willOpen = !item.classList.contains("is-open");
      list.querySelectorAll(".svc").forEach(function (s) {
        s.classList.remove("is-open");
        s.querySelector(".svc__head").setAttribute("aria-expanded", "false");
      });
      if (willOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  }

  /* 3D portrait follows the pointer */
  var stage = document.getElementById("stage");
  var tilt = document.getElementById("tilt");
  var shadow = document.getElementById("shadow");
  if (!stage || !tilt || !shadow || reduceMotion) return;

  var target = { rx: 0, ry: 0 };
  var cur = { rx: 0, ry: 0 };
  var raf = null;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function render() {
    cur.rx = lerp(cur.rx, target.rx, 0.1);
    cur.ry = lerp(cur.ry, target.ry, 0.1);
    tilt.style.setProperty("--rx", cur.rx.toFixed(2) + "deg");
    tilt.style.setProperty("--ry", cur.ry.toFixed(2) + "deg");
    /* shadow slides opposite to the tilt, like a real light source */
    shadow.style.setProperty("--sx", (-cur.ry * 3).toFixed(1) + "px");
    shadow.style.setProperty("--ss", (1 + Math.abs(cur.ry) * 0.015).toFixed(3));
    var settled = Math.abs(cur.rx - target.rx) < 0.02 && Math.abs(cur.ry - target.ry) < 0.02;
    raf = settled ? null : requestAnimationFrame(render);
  }
  function go() { if (!raf) raf = requestAnimationFrame(render); }

  var area = stage.closest(".hero__stage") || stage;
  area.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    var r = area.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width - 0.5;
    var py = (e.clientY - r.top) / r.height - 0.5;
    target.ry = px * 18;
    target.rx = -py * 10;
    go();
  });
  area.addEventListener("pointerleave", function () { target.rx = 0; target.ry = 0; go(); });
})();
