(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const navLinks = Array.from(document.querySelectorAll('.primary-nav a[href^="#"]'));
  const sections = Array.from(document.querySelectorAll("main section[id]")).filter(function (section) {
    return navLinks.some(function (link) { return link.getAttribute("href") === "#" + section.id; });
  });
  const year = document.getElementById("current-year");
  const portrait = document.querySelector(".portrait-image");
  const portraitStage = document.querySelector(".portrait-stage");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (year) year.textContent = String(new Date().getFullYear());

  // The monogram stays visible if the optional portrait asset is missing or fails to load.
  function showPortraitWhenReady() {
    if (portrait && portraitStage && portrait.complete && portrait.naturalWidth > 0) {
      portraitStage.classList.add("has-portrait");
    }
  }

  if (portrait) {
    portrait.addEventListener("load", showPortraitWhenReady);
    portrait.addEventListener("error", function () {
      if (portraitStage) portraitStage.classList.remove("has-portrait");
    });
    showPortraitWhenReady();
  }

  function closeMenu(returnFocus) {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    nav.classList.remove("is-open");
    if (returnFocus) menuToggle.focus();
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      const open = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!open));
      menuToggle.setAttribute("aria-label", open ? "Open navigation menu" : "Close navigation menu");
      nav.classList.toggle("is-open", !open);
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () { closeMenu(false); });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) closeMenu(true);
    });

    document.addEventListener("click", function (event) {
      if (nav.classList.contains("is-open") && !nav.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMenu(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 900) closeMenu(false);
    });
  }

  // Reveal on scroll, while preserving normal visibility when reduced motion is preferred.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });

    revealItems.forEach(function (item, index) {
      item.style.transitionDelay = (index % 3) * 55 + "ms";
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  }

  // Highlight the navigation item for the section currently in view.
  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(function (entries) {
      const visible = entries.filter(function (entry) { return entry.isIntersecting; });
      if (!visible.length) return;
      visible.sort(function (a, b) {
        return Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top);
      });
      const currentId = visible[0].target.id;
      navLinks.forEach(function (link) {
        const active = link.getAttribute("href") === "#" + currentId;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-20% 0px -65% 0px", threshold: 0 });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }
})();
