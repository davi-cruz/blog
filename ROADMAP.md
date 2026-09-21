# ROADMAP


## 1. Where to Add Google Tag Manager (GTM) in the Codebase

All components and configuration hooks have been built and integrated into the blog. You have two convenient places to set your GTM Container ID (`GTM-XXXXXXX`):

### Option A: Via Environment Variable (Recommended for Deployments)
Add the following line to your local `.env` file and to your hosting provider’s environment settings (e.g. Cloudflare Pages, Vercel, Netlify):

```bash
PUBLIC_GTM_ID="GTM-XXXXXXX"
```

### Option B: In [`src/data/siteConfig.ts`](file:///opt/dcruz/blog-private/src/data/siteConfig.ts#L17-L23)
If you prefer keeping it directly in the source code:

```typescript
export const siteConfig: SiteConfig = {
  siteUrl: 'https://davicruz.com',
  author: 'Davi Cruz',
  gtmId: 'GTM-XXXXXXX', // Replace with your actual GTM Container ID
  ...
};
```

---

### How the Astro Architecture Works Under the Hood

The implementation is located across three key files:

1. **[`src/components/GoogleTagManager.astro`](file:///opt/dcruz/blog-private/src/components/GoogleTagManager.astro)**:
   - **Google Consent Mode v2 Default (Strict Privacy)**: Executes synchronously in `<head>` **before** the GTM container script loads. It defaults all storage types to `'denied'`:
     ```javascript
     gtag('consent', 'default', {
       'analytics_storage': 'denied',
       'ad_storage': 'denied',
       'ad_user_data': 'denied',
       'ad_personalization': 'denied',
       'wait_for_update': 500
     });
     ```
   - **Global Privacy Control (GPC)**: Detects `navigator.globalPrivacyControl === true` (used in California/CCPA) and enforces `denied` automatically.
   - **`<noscript>` Iframe**: Injected into `<body>` for non-JS environments.

2. **[`src/components/CookieConsent.astro`](file:///opt/dcruz/blog-private/src/components/CookieConsent.astro)**:
   - Renders a floating, responsive Tailwind banner with equal visual weight for **"Aceitar todos"** and **"Apenas essenciais"** (mandatory under GDPR & LGPD).
   - When accepted:
     ```javascript
     gtag('consent', 'update', { 'analytics_storage': 'granted' });
     dataLayer.push({ event: 'consent_update', analytics_consent: 'granted' });
     ```

3. **[`src/components/Footer.astro`](file:///opt/dcruz/blog-private/src/components/Footer.astro#L16-L28)**:
   - Contains a persistent **"Preferências de Cookies" / "Cookie Settings"** button that dispatches `open-cookie-banner` to allow users to withdraw or adjust consent at any time (mandatory under **GDPR Art. 7(3)**).

---

## 2. What to Configure Inside Google Tag Manager (GTM)

To ensure that both **Google Analytics 4 (GA4)** and **Microsoft Clarity** comply with **GDPR (EU)**, **LGPD (Brazil)**, and **CCPA/CPRA (California)**, configure GTM with the following steps:

### Step 1: Enable Consent Overview in GTM
1. Go to your GTM Container dashboard.
2. Navigate to **Admin** > **Container Settings**.
3. Under **Additional Settings**, check **"Enable consent overview"** and click **Save**.
4. You will now see a shield icon (**Consent Overview**) on the **Tags** page.

---

### Step 2: Configure Google Analytics 4 (GA4)
GA4 natively integrates with Google Consent Mode v2. When consent is `denied`, it automatically transmits cookieless pings (no cookies or device fingerprinting).

1. In GTM, click **Tags** > **New**.
2. **Tag Type**: **Google Tag** (or *Google Analytics: GA4 Configuration*).
3. **Tag ID**: Enter your GA4 Measurement ID (`G-XXXXXXXXXX`).
4. **Trigger**: **Initialization - All Pages** (or **Consent Initialization - All Pages**).
5. **Consent Settings** (under *Advanced Settings*):
   - GA4 already has **Built-in Consent Checks** for `analytics_storage`.
   - Leave it set to *Built-in Consent Checks*.
6. In your **GA4 Admin Console** (outside GTM):
   - Go to **Admin** > **Data Settings** > **Data Retention** > Change *Event data retention* to **14 months**.
   - Note: GA4 automatically anonymizes IP addresses on all hits (compliant with GDPR Art. 4).

---

### Step 3: Configure Microsoft Clarity (Crucial Compliance Step)

> [!WARNING]
> Under Microsoft Clarity's terms of service, Microsoft acts as an **independent data controller** and uses session telemetry to train models and serve ads. Clarity **cannot** be loaded under "Legitimate Interest". It must be **100% blocked** until the user explicitly clicks "Aceitar".

You have two options in GTM to ensure Clarity never loads before consent:

#### Option A: Native GTM Additional Consent Check (Recommended)
1. Add the **Microsoft Clarity** tag (via the Community Template Gallery or a *Custom HTML* tag containing Clarity's tracking snippet).
2. Expand **Advanced Settings** > **Consent Settings**.
3. Select **"Require additional consent for tag to fire"**.
4. Add: `analytics_storage`.
5. Trigger: **Initialization - All Pages** (or **All Pages**).
   - *Result:* GTM will evaluate `analytics_storage`. If denied, GTM completely blocks the Clarity script from loading. Once the user clicks "Aceitar", GTM immediately executes the tag.

#### Option B: Triggering on the Custom Consent Event
1. In GTM, go to **Triggers** > **New**.
   - **Trigger Type**: **Custom Event**.
   - **Event name**: `consent_update`.
   - **This trigger fires on**: *Some Custom Events* -> `analytics_consent` equals `granted`.
2. Assign this trigger to your Microsoft Clarity tag.
3. Also create a second trigger for returning visitors who already consented on prior visits:
   - Check if cookie/localStorage `davi_privacy_consent` equals `granted` on Page View.

---

### Step 4: Configure Microsoft Clarity Strict Masking
Inside the [Microsoft Clarity Dashboard](https://clarity.microsoft.com):
1. Go to **Settings** > **Masking**.
2. Set Masking to **Strict** (Balanced or Strict).
   - *Why:* Strict masking obfuscates all text, numbers, and form inputs in session replays, preventing accidental recording of Personal Identifiable Information (PII).

---

## 3. Compliance Verification Checklist

| Regulation | Requirement | Implemented Solution |
| :--- | :--- | :--- |
| **GDPR (EU / UK)** | Prior opt-in consent for tracking & equal-weight decline option | Consent Mode v2 default `denied` in `<head>`. Equal buttons ("Aceitar" vs "Apenas essenciais"). |
| **GDPR Art. 7(3)** | Right to withdraw consent easily at any time | Footer link **"Preferências de Cookies"** reopens banner. |
| **LGPD (Brazil)** | Purpose specification & transparency for user session recordings | Explicit mention of Clarity & Analytics in Portuguese. Scripts held until opt-in. |
| **CCPA / CPRA** | Honor Global Privacy Control (GPC) opt-out signal | Component checks `navigator.globalPrivacyControl` and auto-denies consent. |
| **Security & Performance** | No render-blocking runtime JS libraries | Vanilla JS with Zero npm dependencies, fully integrated with Astro static output. |

All changes and tests have been verified with `astro check` and `npm run build` (147 pages built with 0 errors).