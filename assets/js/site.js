/* Records Reserved | marketing site behaviour
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

  /* ---------- Button splash ----------
     Press feedback for every CTA: a blob blooms from the exact point that was
     pressed (or from the centre on keyboard activation) and fades out. The
     blob inherits the button's text colour, so it themes itself. */

  if (!reduceMotion) {
    var splashHost = ".btn, .lp-btn, .site-header--overlay .nav__login";

    function spawnSplash(el, x, y) {
      var rect = el.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 2.4;
      var dot = document.createElement("span");
      dot.className = "btn-splash";
      dot.style.width = size + "px";
      dot.style.height = size + "px";
      dot.style.left = x - rect.left - size / 2 + "px";
      dot.style.top = y - rect.top - size / 2 + "px";
      el.appendChild(dot);
      dot.addEventListener("animationend", function () {
        dot.remove();
      });
    }

    function splashTarget(target) {
      return target && target.closest ? target.closest(splashHost) : null;
    }

    document.addEventListener("pointerdown", function (event) {
      var el = splashTarget(event.target);
      if (el) spawnSplash(el, event.clientX, event.clientY);
    });

    document.addEventListener("keydown", function (event) {
      if (event.repeat) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      var el = splashTarget(event.target);
      if (!el) return;
      /* Space does not activate a link, so do not pretend it did */
      if (event.key === " " && el.tagName === "A") return;
      var rect = el.getBoundingClientRect();
      spawnSplash(el, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
  }

  /* ---------- Contact form: posts to FormSubmit, delivered to support ----------
     Static site: FormSubmit relays the submission to our inbox. The form
     action (which carries the inbox address) lives in contact.html. */

  var form = document.querySelector("#contact-form");

  if (form) {
    var status = form.querySelector(".form-status");
    var button = form.querySelector('button[type="submit"]');
    var SUPPORT_EMAIL = "kohelethdigitalsolutions@gmail.com";

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var endpoint = String(form.action || "");

      if (endpoint.indexOf("formsubmit.co/") === -1 || endpoint.indexOf("@") === -1) {
        if (status) {
          status.textContent =
            "This form is not connected yet. Write to us directly at " +
            SUPPORT_EMAIL + ".";
          status.classList.add("is-visible");
        }
        return;
      }

      var data = new FormData(form);
      var interest = String(data.get("interest") || "").trim();
      var business = String(data.get("business") || "").trim();

      data.set(
        "_subject",
        "Records Reserved enquiry: " + (interest || "General") +
          (business ? ", " + business : "")
      );

      var payload = {};
      data.forEach(function (value, key) {
        payload[key] = value;
      });

      if (button) {
        button.disabled = true;
        button.textContent = "Sending…";
      }

      fetch(endpoint.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (result) {
          if (result.success === true || result.success === "true") {
            form.reset();
            if (status) {
              status.textContent =
                "Thank you, your enquiry is on its way to " + SUPPORT_EMAIL +
                ". We reply within the working day.";
              status.classList.add("is-visible");
            }
          } else {
            throw new Error(result.message || "Submission failed");
          }
        })
        .catch(function (error) {
          if (status) {
            status.textContent =
              "That did not send (" + (error && error.message ? error.message : "network error") +
              "). Please write to us directly at " +
              SUPPORT_EMAIL + " or call +265 998 814 732.";
            status.classList.add("is-visible");
          }
          if (window.console && console.error) {
            console.error("FormSubmit submission failed:", error);
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
