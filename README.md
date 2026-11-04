# Records Reserved — marketing site

The public landing site for **Records Reserved**, a multi-tenant POS and business management platform for shops, workshops, salons and hire fleets.

Static HTML/CSS/JS — no build step. Open `index.html` or serve the folder with any static server.

Pages are served at extensionless URLs (`/features`, `/pricing`, `/contact`); Vercel redirects the old `.html` paths automatically via `cleanUrls`.

## Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| Features | `features.html` |
| Industries | `industries.html` |
| Pricing | `pricing.html` |
| Contact | `contact.html` |

## Live

- Landing: https://records-reserved.vercel.app
- Platform: https://mwkpos.vercel.app

## SEO

Already in place: canonical URLs, Open Graph and Twitter cards, JSON-LD (Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList), a sitemap, `robots.txt`, descriptive titles, unique meta descriptions, WebP/AVIF-ready `<picture>` images, lazy loading below the fold and a preloaded hero image.

After a deploy:

1. Add `https://records-reserved.vercel.app/` as a property in [Google Search Console](https://search.google.com/search-console).
2. Verify ownership with a DNS TXT record, or add the supplied verification tag to the `<head>` of every page.
3. Submit `https://records-reserved.vercel.app/sitemap.xml`.
4. Import the property into [Bing Webmaster Tools](https://www.bing.com/webmasters) from Search Console.
5. Request indexing for the home page, then check the Pages report for crawl errors.

Rankings take time and depend on content, links and search intent, not only on tags. Keep publishing genuinely useful pages for the trades you serve.

## Analytics

All tracking is configured in one file: `assets/js/analytics.js`. Open it and fill in the IDs at the top. If an ID is left empty, no request is made to that service.

| Setting | Use |
| --- | --- |
| `gtmId` | Google Tag Manager container (`GTM-XXXXXXX`). Recommended: manage GA4, ads and pixels from GTM. |
| `ga4Id` | GA4 measurement ID (`G-XXXXXXXXXX`). Only loaded when `gtmId` is empty. |
| `clarityId` | Microsoft Clarity project ID for heatmaps and session recordings. Optional. |
| `debug` | Set `true` to log every event to the browser console while testing. |

`analytics.js` loads asynchronously and never blocks rendering. All events are pushed to `window.dataLayer`, so they can be used as GTM triggers or GA4 custom events:

- `trial_cta_click` — any click to the app (`mwkpos.vercel.app`)
- `outbound_click` — any external link
- `email_click`, `phone_click`, `whatsapp_click` — contact actions
- `nav_click` — internal navigation
- `contact_form_start`, `contact_form_submit`, `contact_form_success`, `contact_form_error` — enquiry funnel
- `faq_open` — expanded FAQ question
- `pricing_plan_view` — plan card seen in the viewport
- `scroll_depth` — 25, 50, 75 and 90 percent
- `announce_dismiss` — free-trial bar closed
- `page_engagement` — time on page when the visitor leaves or hides the tab

### GTM setup

1. Create a GA4 configuration tag on the **All Pages** trigger and enter your GA4 measurement ID.
2. Create GA4 event tags for the custom events above, using the event name as both the GTM trigger and the GA4 event name.
3. Mark `contact_form_success` and `trial_cta_click` as conversions or key events in GA4.
4. Preview the container, confirm the events fire, then publish.

## Contact

- kohelethdigitalsolutions@gmail.com
- +265 998 814 732
