/* ==========================================================
   Portfolio JS
   - Theme toggle (persisted)
   - Mobile nav toggle + close on link click/escape/outside
   - Scroll reveal via IntersectionObserver
   - Animate skill bars when visible
   - Header elevation on scroll
   - Contact form: mailto fallback (no backend required)
   ========================================================== */

(() => {
  const root = document.documentElement;

  // ---------------------------
  // Theme (persist user choice)
  // ---------------------------
  const THEME_KEY = "portfolio.theme";
  const themeToggle = document.querySelector("[data-theme-toggle]");

  function applyTheme(theme) {
    if (theme === "light") {
      root.dataset.theme = "light";
      themeToggle?.setAttribute("aria-pressed", "true");
      localStorage.setItem(THEME_KEY, "light");
    } else {
      delete root.dataset.theme;
      themeToggle?.setAttribute("aria-pressed", "false");
      localStorage.setItem(THEME_KEY, "dark");
    }
  }

  function getInitialTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;

    const prefersLight =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches;

    return prefersLight ? "light" : "dark";
  }

  applyTheme(getInitialTheme());

  themeToggle?.addEventListener("click", () => {
    const isLight = root.dataset.theme === "light";
    applyTheme(isLight ? "dark" : "light");
  });

  // ---------------------------
  // Header elevate on scroll
  // ---------------------------
  const header = document.querySelector("[data-elevate-header]");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-elevated", window.scrollY > 6);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---------------------------
  // Mobile nav
  // ---------------------------
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");
  const navLinks = navMenu ? navMenu.querySelectorAll("a.nav-link") : [];

  function setNavOpen(open) {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navMenu.classList.toggle("is-open", open);
  }

  navToggle?.addEventListener("click", () => {
    const open = navMenu?.classList.contains("is-open");
    setNavOpen(!open);
  });

  navLinks.forEach((a) => {
    a.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNavOpen(false);
  });

  document.addEventListener("click", (e) => {
    if (!navMenu || !navToggle) return;
    const target = e.target;
    if (!(target instanceof Node)) return;

    const clickedInsideMenu = navMenu.contains(target);
    const clickedToggle = navToggle.contains(target);

    if (!clickedInsideMenu && !clickedToggle) setNavOpen(false);
  });

  // ---------------------------
  // Scroll reveal + skill bars
  // ---------------------------
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const skillEls = Array.from(document.querySelectorAll(".skill"));

  function fillSkill(skillEl) {
    const pct = Number(skillEl.getAttribute("data-skill") || "0");
    const barFill = skillEl.querySelector(".bar-fill");
    const bar = skillEl.querySelector(".bar");

    if (bar) {
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuemax", "100");
      bar.setAttribute("aria-valuenow", String(Math.max(0, Math.min(100, pct))));
    }

    if (barFill instanceof HTMLElement) {
      barFill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    }
  }

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    skillEls.forEach(fillSkill);
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");

          if (entry.target.classList.contains("skill")) {
            fillSkill(entry.target);
          }

          io.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
    );

    revealEls.forEach((el) => io.observe(el));
    skillEls.forEach((el) => io.observe(el));
  } else {
    // Fallback
    revealEls.forEach((el) => el.classList.add("is-visible"));
    skillEls.forEach(fillSkill);
  }

  // ---------------------------
  // Footer year
  // ---------------------------
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------------------------
  // Contact form (mailto fallback)
  // ---------------------------
  const form = document.querySelector("[data-contact-form]");
  const statusEl = document.querySelector("[data-form-status]");

  function setStatus(msg, kind = "info") {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.dataset.kind = kind;
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!(form instanceof HTMLFormElement)) return;

    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();

    if (!name || !email || !message) {
      setStatus("Please fill out all fields.", "error");
      return;
    }

    // Change this to your email
    const to = "you@email.com";

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}\n`
    );

    setStatus("Opening your email client…", "ok");

    // mailto: works for static hosting without a backend
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

    // Optional: reset after a small delay
    window.setTimeout(() => {
      form.reset();
      setStatus("Message ready. If your mail client didn't open, copy your message and email me directly.", "info");
    }, 700);
  });
})();
