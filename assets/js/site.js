/* Records Reserved — marketing site behaviour
   Reveals, mobile nav, contact form hand-off. No dependencies. */

(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */

  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");

  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll(".nav__links a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  /* ---------- Scroll reveals (IntersectionObserver only) ---------- */

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealables = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealables.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Contact form — compose a mail to support ----------
     Static site: the form builds a well-formed email rather than
     pretending to post to a server that does not exist. */

  var form = document.querySelector("#contact-form");

  if (form) {
    var status = form.querySelector(".form-status");
    var SUPPORT_EMAIL = "kohelethdigitalsolutions@gmail.com";

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var data = new FormData(form);
      var name = String(data.get("name") || "").trim();
      var business = String(data.get("business") || "").trim();
      var email = String(data.get("email") || "").trim();
      var phone = String(data.get("phone") || "").trim();
      var interest = String(data.get("interest") || "").trim();
      var message = String(data.get("message") || "").trim();

      var subject =
        "Records Reserved enquiry — " + (interest || "General") +
        (business ? " — " + business : "");

      var body = [
        "Name: " + name,
        "Business: " + (business || "—"),
        "Email: " + email,
        "Phone: " + (phone || "—"),
        "Interested in: " + (interest || "General"),
        "",
        message,
      ].join("\n");

      var href =
        "mailto:" + SUPPORT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = href;

      if (status) {
        status.textContent =
          "Your email app should be opening with the message ready to send to " +
          SUPPORT_EMAIL + ". If nothing opened, write to us directly at that address.";
        status.classList.add("is-visible");
      }
    });
  }
})();
