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

  /* ---------- Contact form — posts to Web3Forms, delivered to support ----------
     Static site: Web3Forms relays the submission to our inbox. The access
     key lives in a hidden input in contact.html. */

  var form = document.querySelector("#contact-form");

  if (form) {
    var status = form.querySelector(".form-status");
    var button = form.querySelector('button[type="submit"]');
    var SUPPORT_EMAIL = "kohelethdigitalsolutions@gmail.com";

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var data = new FormData(form);
      var accessKey = String(data.get("access_key") || "").trim();

      if (!accessKey || accessKey === "YOUR_WEB3FORMS_ACCESS_KEY") {
        if (status) {
          status.textContent =
            "This form is not connected yet. Write to us directly at " +
            SUPPORT_EMAIL + ".";
          status.classList.add("is-visible");
        }
        return;
      }

      var name = String(data.get("name") || "").trim();
      var business = String(data.get("business") || "").trim();
      var email = String(data.get("email") || "").trim();
      var phone = String(data.get("phone") || "").trim();
      var interest = String(data.get("interest") || "").trim();

      data.set(
        "subject",
        "Records Reserved enquiry — " + (interest || "General") +
          (business ? " — " + business : "")
      );
      data.append("_replyto", email);
      data.append(
        "body",
        [
          "Name: " + name,
          "Business: " + (business || "—"),
          "Email: " + email,
          "Phone: " + (phone || "—"),
          "Interested in: " + (interest || "General"),
        ].join("\n")
      );

      if (button) {
        button.disabled = true;
        button.textContent = "Sending…";
      }

      fetch(form.action, {
        method: "POST",
        body: data,
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (result) {
          if (result.success) {
            form.reset();
            if (status) {
              status.textContent =
                "Thank you — your enquiry is on its way to " + SUPPORT_EMAIL +
                ". We reply within the working day.";
              status.classList.add("is-visible");
            }
          } else {
            throw new Error(result.message || "Submission failed");
          }
        })
        .catch(function () {
          if (status) {
            status.textContent =
              "That did not send. Please write to us directly at " +
              SUPPORT_EMAIL + " or call +265 998 814 732.";
            status.classList.add("is-visible");
          }
        })
        .finally(function () {
          if (button) {
            button.disabled = false;
            button.textContent = "Send enquiry";
          }
        });
    });
  }
})();
