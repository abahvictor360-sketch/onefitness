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
      src: "/assets/img/meal-plate.jpg",
      alt: "Balanced bowl with chicken, rice and vegetables",
      calories: 2091,
      goal: 2200,
    },
    vegan: {
      src: "/assets/img/meal-bowl.jpg",
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
        ? "Thanks, your tailored first week is on the way to " + value + "."
        : "Please enter a valid email address.";
      if (valid) form.reset();
    });
  }

  /* ── Contact form ──────────────────────────────────── */
  // No backend is wired up yet. Set this to an endpoint (a Vercel function,
  // Formspree, etc.) and the form will POST to it instead of only confirming
  // locally.
  const FORM_ENDPOINT = null;

  const contactForm = $("#contactForm");
  const contactNote = $("#contactNote");

  if (contactForm && contactNote) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
      cemail: (v) => (emailRe.test(v.trim()) ? "" : "Please enter a valid email address."),
      topic: (v) => (v ? "" : "Please choose a topic."),
      message: (v) => (v.trim().length >= 10 ? "" : "Please add a little more detail (10 characters or more)."),
      consent: (v, el) => (el.checked ? "" : "Please confirm we may reply to you."),
    };

    function validateField(id) {
      const el = $("#" + id, contactForm);
      if (!el) return true;
      const msg = rules[id](el.value, el);
      const errEl = $("#err-" + id, contactForm);
      const field = el.closest(".field");

      if (field) field.classList.toggle("invalid", Boolean(msg));
      el.setAttribute("aria-invalid", String(Boolean(msg)));
      if (errEl) {
        errEl.textContent = msg;
        errEl.hidden = !msg;
      }
      return !msg;
    }

    Object.keys(rules).forEach((id) => {
      const el = $("#" + id, contactForm);
      if (!el) return;
      // Only nag after a field has been visited once.
      el.addEventListener("blur", () => validateField(id));
      el.addEventListener("input", () => {
        const field = el.closest(".field");
        if ((field && field.classList.contains("invalid")) || el.getAttribute("aria-invalid") === "true") {
          validateField(id);
        }
      });
    });

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const results = Object.keys(rules).map(validateField);
      if (results.includes(false)) {
        contactNote.className = "form-note error";
        contactNote.textContent = "Please fix the highlighted fields and try again.";
        const firstBad = contactForm.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }

      const submitBtn = $(".form-submit", contactForm);
      const name = $("#name", contactForm).value.trim().split(" ")[0];

      if (!FORM_ENDPOINT) {
        contactNote.className = "form-note ok";
        contactNote.textContent =
          "Thanks " + name + ", your message is ready to send. This demo has no mail server attached yet, so nothing was delivered. Email hello@onefitness.com in the meantime.";
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }
      contactNote.className = "form-note";
      contactNote.textContent = "Sending your message...";

      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
        });
        if (!res.ok) throw new Error("Request failed with " + res.status);
        contactNote.className = "form-note ok";
        contactNote.textContent = "Thanks " + name + ", your message is on its way. A coach replies within one working day.";
        contactForm.reset();
      } catch (err) {
        contactNote.className = "form-note error";
        contactNote.textContent = "Something went wrong sending that. Please email hello@onefitness.com instead.";
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send message";
        }
      }
    });
  }

  /* ── Footer year ───────────────────────────────────── */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
