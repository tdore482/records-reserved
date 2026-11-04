/* Records Reserved | analytics loader and first-party event tracking.

   Configure the three IDs below and deploy. If an ID is empty, no request is
   made to that service, so the site keeps working with zero third-party calls.

   Recommended setup:
     gtmId      Google Tag Manager container, e.g. "GTM-XXXXXXX". Use this if
                you want to manage GA4, ads and pixels from one place.
     ga4Id      Google Analytics 4 measurement ID, e.g. "G-XXXXXXXXXX". Only
                loaded when gtmId is empty.
     clarityId  Microsoft Clarity project ID. Optional: heatmaps and session
                recordings.
     debug      true logs every event to the console. Leave false in production.

   Every event is pushed to window.dataLayer, so GTM triggers and GA4 custom
   events can be created against the names documented in README.md. */

(function () {
  "use strict";

  var CONFIG = {
    gtmId: "",
    ga4Id: "",
    clarityId: "",
    debug: true,
    trackScrollDepth: true,
  };

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = window.gtag || gtag;

  function track(name, params) {
    var payload = {
      event: name,
      page_path: location.pathname + location.search,
      page_location: location.href,
      page_title: document.title,
    };

    if (params) {
      Object.keys(params).forEach(function (key) {
        if (params[key] !== undefined && params[key] !== null) {
          payload[key] = params[key];
        }
      });
    }

    window.dataLayer.push(payload);

    if (CONFIG.debug && window.console && console.log) {
      console.log("[analytics]", name, payload);
    }
  }

  window.rrTrack = track;

  /* ---------- Vendor loaders (async, never block rendering) ---------- */

  if (CONFIG.gtmId) {
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js",
    });

    var gtm = document.createElement("script");
    gtm.async = true;
    gtm.src =
      "https://www.googletagmanager.com/gtm.js?id=" +
      encodeURIComponent(CONFIG.gtmId);
    document.head.appendChild(gtm);
  } else if (CONFIG.ga4Id) {
    var ga = document.createElement("script");
    ga.async = true;
    ga.src =
      "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(CONFIG.ga4Id);
    document.head.appendChild(ga);

    gtag("js", new Date());
    gtag("config", CONFIG.ga4Id, { anonymize_ip: true });
  }

  if (CONFIG.clarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      t = l.createElement(r);
      t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CONFIG.clarityId);
  }

  /* ---------- Helpers ---------- */

  function cleanText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 90);
  }

  function linkText(link) {
    return cleanText(link.textContent || link.getAttribute("aria-label") || "");
  }

  function locationName(el) {
    var section = el && el.closest ? el.closest("section, header, footer") : null;
    if (!section) return "page";
    return section.id || cleanText(section.className).split(" ")[0] || "page";
  }

  function linkType(href) {
    if (!href) return "internal";
    if (href.indexOf("mwkpos.vercel.app") !== -1) return "app";
    if (href.indexOf("wa.me/") !== -1 || href.indexOf("whatsapp") !== -1) {
      return "whatsapp";
    }
    if (href.indexOf("mailto:") === 0) return "email";
    if (href.indexOf("tel:") === 0) return "phone";
    if (/^https?:\/\//i.test(href)) return "outbound";
    return "internal";
  }

  function isExternal(href) {
    if (!href || !/^https?:\/\//i.test(href)) return false;
    return href.indexOf(location.hostname) === -1;
  }

  /* ---------- Link and CTA tracking ---------- */

  document.addEventListener(
    "click",
    function (event) {
      var link = event.target.closest ? event.target.closest("a") : null;
      if (!link) return;

      var href = link.getAttribute("href") || "";
      var type = linkType(href);
      var text = linkText(link);
      var params = {
        link_url: href,
        link_text: text,
        link_type: type,
        link_location: locationName(link),
      };

      if (type === "app") {
        track("trial_cta_click", params);
      } else if (type === "whatsapp") {
        track("whatsapp_click", params);
      } else if (type === "email") {
        track("email_click", params);
      } else if (type === "phone") {
        track("phone_click", params);
      }

      if (isExternal(href)) {
        track("outbound_click", params);
      }

      if (type === "internal" && link.closest(".nav")) {
        track("nav_click", params);
      }
    },
    true
  );

  /* ---------- Contact form funnel ---------- */

  var form = document.getElementById("contact-form");

  if (form) {
    var started = false;

    function markStarted() {
      if (started) return;
      started = true;
      track("contact_form_start", { form_id: form.id });
    }

    form.addEventListener("focusin", markStarted);

    form.addEventListener("submit", function () {
      var interest = form.querySelector('[name="interest"]');
      track("contact_form_submit", {
        form_id: form.id,
        interest: interest ? interest.value : "",
      });
    });
  }

  /* Form success/error are emitted by site.js after FormSubmit responds. */

  /* ---------- FAQ engagement ---------- */

  document.addEventListener(
    "toggle",
    function (event) {
      var details = event.target;
      if (!details || details.tagName !== "DETAILS" || !details.open) return;

      var summary = details.querySelector("summary");
      track("faq_open", {
        question: cleanText(summary ? summary.textContent : ""),
      });
    },
    true
  );

  /* ---------- Pricing plan visibility ---------- */

  var plans = document.querySelectorAll(".plan");

  if (plans.length && "IntersectionObserver" in window) {
    var planObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          planObserver.unobserve(entry.target);
          var name = entry.target.querySelector(".plan__name");
          track("pricing_plan_view", {
            plan: cleanText(name ? name.textContent : ""),
          });
        });
      },
      { threshold: 0.5 }
    );

    plans.forEach(function (plan) {
      planObserver.observe(plan);
    });
  }

  /* ---------- Scroll depth ---------- */

  if (CONFIG.trackScrollDepth) {
    var marks = [25, 50, 75, 90];
    var seen = {};
    var ticking = false;

    function measureScroll() {
      ticking = false;

      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      var percent = Math.min(
        100,
        Math.round(((window.scrollY || doc.scrollTop || 0) / scrollable) * 100)
      );

      marks.forEach(function (mark) {
        if (percent >= mark && !seen[mark]) {
          seen[mark] = true;
          track("scroll_depth", { percent: mark });
        }
      });
    }

    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(measureScroll);
      },
      { passive: true }
    );
  }

  /* ---------- Announcement bar dismissal ---------- */

  document.addEventListener(
    "click",
    function (event) {
      if (
        event.target.closest &&
        event.target.closest("[data-announce-close]")
      ) {
        track("announce_dismiss", { bar: "free_trial" });
      }
    },
    true
  );

  /* ---------- Page engagement (time on page) ---------- */

  var engagedAt = Date.now();
  var engagementSent = false;

  function sendEngagement() {
    if (engagementSent) return;
    engagementSent = true;
    track("page_engagement", {
      engagement_time_msec: Date.now() - engagedAt,
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") sendEngagement();
  });

  window.addEventListener("pagehide", sendEngagement);
})();
