# SEO & Privacy Implementation Action Plan

This action plan documents the implemented fixes for issues identified in `FULL-AUDIT-REPORT.md`, along with instructions for managing analytics via Google Tag Manager (GTM) compliant with GDPR, LGPD, and CCPA/CPRA.

---

## Phase 1: High Priority (Fix Technical & i18n Blockers) — [COMPLETED]

### 1. Fix Hreflang Alternates in `src/layouts/BaseLayout.astro` — [COMPLETED]
- **Status:** Done.
- **Implemented:**
  1. For blog posts, only output hreflang for languages where a translation exists. Missing translations are cleanly omitted.
  2. For tag pages, verified against existing tags in each language before outputting hreflang (preventing 404 links).
  3. Aligned trailing slashes between canonicals and self-referencing hreflangs.
  4. Standardized BCP 47 language code to `pt-BR`.

### 2. Add XML Sitemap (`@astrojs/sitemap`) — [COMPLETED]
- **Status:** Done.
- **Implemented:**
  1. Installed compatible `@astrojs/sitemap` (v3.1.6).
  2. Added `sitemap()` to `astro.config.mjs` with multilingual locale mappings (`pt-br`, `en`, `es`).
  3. Updated `public/robots.txt` pointing to `https://davicruz.com/sitemap-index.xml`.
  4. Added permissions for AI search crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`, etc.).
  5. Added `public/llms.txt` for Generative Engine Optimization (GEO).

### 3. Add Schema.org JSON-LD Structured Data — [COMPLETED]
- **Status:** Done.
- **Implemented:**
  1. Created `src/components/SchemaOrg.astro`.
  2. Emits `TechArticle` / `BlogPosting` on post pages with comprehensive `Person` author entity (Davi Cruz, Senior Customer Engineer, Security @ Google Cloud, sameAs links to LinkedIn, Twitter, GitHub).
  3. Emits `BreadcrumbList` on posts, tags, and subpages.
  4. Emits `WebSite` on all pages.
  5. Verified with `validate_schema.py` (0 errors, 0 warnings).

---

## Phase 2: Accessibility & On-Page Refinements — [COMPLETED]

### 4. Remove Duplicate H2 from Table of Contents — [COMPLETED]
- **Status:** Done.
- **Implemented:** Replaced `<h2>` with semantic `<p>` inside `<nav aria-label="...">` in `src/components/TableOfContents.astro`.

### 5. Add Descriptive `aria-label` to Footer Social Links — [COMPLETED]
- **Status:** Done.
- **Implemented:** Verified and added accessible labels across GitHub, LinkedIn, Twitter, and RSS feed links in `src/components/Footer.astro`.

---

## Phase 3: Privacy & Google Tag Manager Architecture — [COMPLETED]

### 6. Centralized GTM Configuration & Consent Mode v2
- **Status:** Done.
- **Implemented:**
  - Added `gtmId` to `src/data/siteConfig.ts` with fallback to `process.env.PUBLIC_GTM_ID`.
  - Created `src/components/GoogleTagManager.astro`:
    - In `<head>`: Executes **Google Consent Mode v2** defaults (`analytics_storage: 'denied'`, `ad_storage: 'denied'`, `wait_for_update: 500`) *strictly before* the GTM container script loads.
    - Respects Global Privacy Control (`navigator.globalPrivacyControl === true`).
    - In `<body>`: Renders `<noscript>` GTM fallback iframe.
  - Created `src/components/CookieConsent.astro`:
    - Multilingual banner (`pt-br`, `en`, `es`) with equal-prominence "Aceitar todos" and "Apenas essenciais" buttons.
    - On accept: Pushes `analytics_storage: 'granted'` to `gtag` and dispatches `consent_update` to `dataLayer`.
    - On decline: Pushes `analytics_storage: 'denied'`.
  - Added persistent "Preferências de Cookies" / "Cookie Settings" button in `src/components/Footer.astro` to allow users to reopen and adjust consent at any time (GDPR Art. 7(3)).
