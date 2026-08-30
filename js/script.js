(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile nav toggle */
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("main-nav");

  if (toggle && nav) {
    function setMenuState(open) {
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    }

    toggle.addEventListener("click", function () {
      setMenuState(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuState(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setMenuState(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1100) setMenuState(false);
    }, { passive: true });
  }

  /* Theme toggle (light/dark), persisted in localStorage */
  var themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    function currentTheme() {
      var explicit = document.documentElement.getAttribute("data-theme");
      if (explicit === "light" || explicit === "dark") return explicit;
      return prefersDark.matches ? "dark" : "light";
    }

    function applyThemeLabel() {
      var isDark = currentTheme() === "dark";
      themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
      themeToggle.setAttribute("aria-label", isDark ? "Activer le thème clair" : "Activer le thème sombre");
    }
    applyThemeLabel();
    if (typeof prefersDark.addEventListener === "function") {
      prefersDark.addEventListener("change", applyThemeLabel);
    }

    themeToggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("rs-theme", next); } catch (e) {}
      applyThemeLabel();
    });
  }

  /* Sticky header: shrink + shadow, and scroll progress bar */
  var header = document.getElementById("site-header");
  var progressBar = document.getElementById("scroll-progress");
  var ticking = false;

  function updateOnScroll() {
    var scrollY = window.scrollY || window.pageYOffset;

    if (header) {
      header.classList.toggle("is-scrolled", scrollY > 12);
    }

    if (progressBar) {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      progressBar.style.width = pct + "%";
    }

    var floatWhatsapp = document.getElementById("float-whatsapp");
    var floatTop = document.getElementById("float-top");
    var showFloats = scrollY > 420;
    if (floatWhatsapp) floatWhatsapp.classList.toggle("is-visible", showFloats);
    if (floatTop) floatTop.classList.toggle("is-visible", showFloats);

    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }, { passive: true });
  updateOnScroll();

  var floatTopBtn = document.getElementById("float-top");
  if (floatTopBtn) {
    floatTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* Scrollspy: highlight the nav link matching the section in view */
  var navLinks = document.querySelectorAll("[data-nav-link]");
  if (navLinks.length && "IntersectionObserver" in window) {
    var linkById = {};
    navLinks.forEach(function (link) {
      var id = link.getAttribute("href").replace("#", "");
      linkById[id] = link;
    });

    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkById[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove("is-active"); });
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });

    Object.keys(linkById).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spyObserver.observe(section);
    });
  }

  /* Reveal-on-scroll animations */
  if ("IntersectionObserver" in window) {
    var revealTargets = document.querySelectorAll(".reveal, .reveal-stagger");
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    document.querySelectorAll(".reveal, .reveal-stagger").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Horizontal projects carousel */
  (function () {
    var track = document.getElementById("projects-track");
    var prev = document.getElementById("projects-prev");
    var next = document.getElementById("projects-next");
    var dotsHost = document.getElementById("projects-dots");
    if (!track) return;

    var slides = Array.prototype.slice.call(track.querySelectorAll("[data-project-slide]"));
    var dots = [];
    var activeIndex = 0;

    function goToProject(index) {
      activeIndex = Math.max(0, Math.min(slides.length - 1, index));
      slides[activeIndex].scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "start"
      });
      updateControls();
    }

    function updateControls() {
      if (prev) prev.disabled = activeIndex === 0;
      if (next) next.disabled = activeIndex === slides.length - 1;
      dots.forEach(function (dot, index) {
        var selected = index === activeIndex;
        dot.classList.toggle("is-active", selected);
        dot.setAttribute("aria-current", selected ? "true" : "false");
      });
    }

    slides.forEach(function (slide, index) {
      if (!dotsHost) return;
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "project-dot";
      var title = slide.querySelector("h3");
      dot.setAttribute("aria-label", "Afficher " + (title ? title.textContent : "le prototype " + (index + 1)));
      dot.addEventListener("click", function () { goToProject(index); });
      dotsHost.appendChild(dot);
      dots.push(dot);
    });

    if (prev) prev.addEventListener("click", function () { goToProject(activeIndex - 1); });
    if (next) next.addEventListener("click", function () { goToProject(activeIndex + 1); });
    track.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToProject(activeIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToProject(activeIndex + 1);
      }
    });

    var scrollTimer;
    track.addEventListener("scroll", function () {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(function () {
        var trackLeft = track.getBoundingClientRect().left;
        var closest = 0;
        var closestDistance = Infinity;
        slides.forEach(function (slide, index) {
          var distance = Math.abs(slide.getBoundingClientRect().left - trackLeft);
          if (distance < closestDistance) {
            closestDistance = distance;
            closest = index;
          }
        });
        activeIndex = closest;
        updateControls();
      }, 80);
    }, { passive: true });

    updateControls();
  })();

  /* Keep the FAQ concise by leaving only one answer open at a time */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* On desktop, one vertical wheel gesture advances exactly one section. */
  (function () {
    var DESKTOP_MIN_WIDTH = 900;
    var sections = Array.prototype.slice.call(document.querySelectorAll(".hero, .section, .site-footer"));
    if (!sections.length) return;

    var cooling = false;

    function isDesktop() {
      return window.innerWidth >= DESKTOP_MIN_WIDTH;
    }

    function closestIndex() {
      var best = 0;
      var bestDistance = Infinity;
      sections.forEach(function (section, index) {
        var distance = Math.abs(section.getBoundingClientRect().top);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      return best;
    }

    function goToSection(index) {
      index = Math.max(0, Math.min(sections.length - 1, index));
      sections[index].scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
      cooling = true;
      window.setTimeout(function () {
        cooling = false;
      }, reduceMotion ? 150 : 650);
    }

    window.addEventListener("wheel", function (event) {
      if (!isDesktop() || Math.abs(event.deltaY) < 4) return;
      event.preventDefault();
      if (cooling) return;
      goToSection(closestIndex() + (event.deltaY > 0 ? 1 : -1));
    }, { passive: false });
  })();

  /* Footer copyright year */
  var footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  /* Formspree forms, submitted without reloading the page */
  function setupForm(formId, statusId, successMessage) {
    var form = document.getElementById(formId);
    var status = document.getElementById(statusId);
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // honeypot: si rempli, on abandonne silencieusement (bot)
      var honeypot = form.querySelector('[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalLabel = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi en cours…";
      }
      form.setAttribute("aria-busy", "true");
      if (status) {
        status.textContent = "";
        status.className = "form-status";
      }

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            if (status) {
              status.textContent = successMessage;
              status.className = "form-status success";
            }
          } else {
            throw new Error("Erreur d'envoi");
          }
        })
        .catch(function () {
          if (status) {
            status.textContent = "L'envoi a échoué. Réessayez ou écrivez-nous directement sur WhatsApp.";
            status.className = "form-status error";
          }
        })
        .finally(function () {
          form.removeAttribute("aria-busy");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
        });
    });
  }

  setupForm(
    "contact-form",
    "form-status",
    "Message envoyé, merci ! Nous revenons vers vous rapidement."
  );
  setupForm(
    "review-form",
    "review-status",
    "Merci pour votre avis ! Il a bien été envoyé et sera lu avec attention."
  );
})();
