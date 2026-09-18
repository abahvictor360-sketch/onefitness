/* onefitness — interactions */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ── Mobile navigation ─────────────────────────────── */
  const toggle = $("#navToggle");
  const nav = $("#primary-nav");
  const scrim = $("#navScrim");

  function setNav(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
    if (scrim) scrim.hidden = !open;
  }

  if (toggle) {
    toggle.addEventListener("click", () =>
      setNav(toggle.getAttribute("aria-expanded") !== "true")
    );
  }
  if (scrim) scrim.addEventListener("click", () => setNav(false));
  if (nav) nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setNav(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNav(false);
  });
  // Close the drawer if the viewport grows past the mobile breakpoint.
  const wide = window.matchMedia("(min-width: 901px)");
  const onWide = (e) => { if (e.matches) setNav(false); };
  wide.addEventListener ? wide.addEventListener("change", onWide) : wide.addListener(onWide);

  /* ── Sticky header state ───────────────────────────── */
  const header = $(".site-header");
  const onScroll = () => {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── Reveal on scroll ──────────────────────────────── */
  const revealables = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          setTimeout(() => el.classList.add("in"), Math.min(i, 5) * 70);
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealables.forEach((el) => io.observe(el));
  }

  /* ── Meal preference switch ────────────────────────── */
  const meals = {
    "non-vegan": {
      src: "assets/img/meal-plate.jpg",
      alt: "Balanced bowl with chicken, rice and vegetables",
      calories: 2091,
      goal: 2200,
    },
    vegan: {
      src: "assets/img/meal-bowl.jpg",
      alt: "Colourful plant-based bowl with fruit, greens and seeds",
      calories: 1840,
      goal: 2000,
    },
  };

  const mealImage = $("#mealImage");
  const calNow = $("#calNow");
  const calGoal = $("#calGoal");
  const calFill = $("#calFill");

  function paintCalories(current, goal) {
    if (calNow) calNow.textContent = String(current);
    if (calGoal) calGoal.textContent = String(goal);
    if (calFill) calFill.style.width = Math.min(100, (current / goal) * 100) + "%";
  }

  $$(".diet").forEach((btn) => {
    btn.addEventListener("click", () => {
      const data = meals[btn.dataset.diet];
      if (!data) return;

      $$(".diet").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", String(on));
      });

      if (mealImage) {
        mealImage.classList.add("is-swapping");
        const swap = () => {
          mealImage.src = data.src;
          mealImage.alt = data.alt;
          mealImage.classList.remove("is-swapping");
        };
        setTimeout(swap, 220);
      }
      paintCalories(data.calories, data.goal);
    });
  });

  paintCalories(meals["non-vegan"].calories, meals["non-vegan"].goal);

  /* ── CTA form ──────────────────────────────────────── */
  const form = $("#ctaForm");
  const note = $("#formNote");
  if (form && note) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = $("#email", form).value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      note.className = "form-note " + (valid ? "ok" : "error");
      note.textContent = valid
        ? "Thanks — your tailored first week is on the way to " + value + "."
        : "Please enter a valid email address.";
      if (valid) form.reset();
    });
  }

  /* ── Footer year ───────────────────────────────────── */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
