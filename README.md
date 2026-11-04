# UNTOUCH

A premium restaurant ordering platform — storefront, customer accounts, cart, checkout, order
tracking and a hidden restaurant management dashboard.

**Developed by Team Realhackers · Project Host: Haider Baloch**

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first theme in `app/globals.css`) |
| Motion | Framer Motion + GSAP-ready utilities, reduced-motion aware |
| Auth | Firebase Authentication (email/password + Google) |
| Database | Firebase Realtime Database — the only application database |
| Server | Firebase Admin SDK inside Next route handlers |
| Media | Cloudinary signed uploads (secret server-side only) |
| Charts | Recharts |
| State | Zustand (persistent cart) |

---

## PWA & consent

The storefront installs as a Progressive Web App and ships a versioned cookie/storage consent
system.

- **Manifest** — `app/manifest.ts` (name `UNTOUCH`, standalone display, theme/background
  `#0a0908`, shortcuts, maskable + monochrome icons).
- **Icons & launch images** — committed under `public/icons` and `public/splash`. Regenerate them
  from the existing flame mark with `npm run assets:pwa` (requires the `sharp` package that Next
  installs for image optimisation).
- **Service worker** — `public/sw.js` is registered by `components/pwa/service-worker-register.tsx`
  in production builds only. It caches only the public offline shell, icons, fonts and same-origin
  static assets. Account, checkout, order, admin, auth and all API routes are never cached. Updates
  wait for an explicit **Refresh** action, so an old page is never paired with new chunks.
- **Install UI** — shared state lives in `components/pwa/install-context.tsx`. Chromium uses the
  `beforeinstallprompt` event only after a click; iOS, Firefox, Safari and in-app browsers get
  illustrated Add to Home Screen instructions. Dismissals last for the browser session and all
  install controls disappear when the app is already running standalone.
- **Consent** — `lib/consent.ts` persists `{ version, status, essential, analytics, marketing,
  decidedAt }` in localStorage. Firebase Analytics is not imported or initialised until analytics
  consent is granted, and revoking analytics disables collection and clears `_ga` cookies
  (`lib/firebase/analytics.ts`). Essential Firebase Auth, cart and checkout are untouched.
- **Policy page** — `/cookies` documents the exact storage technologies. Reopen preferences from
  the footer link at any time.

### Production requirements

1. Serve the site over **HTTPS** (or `localhost`). Service workers and install prompts do not work
   on plain HTTP.
2. Set `NEXT_PUBLIC_SITE_URL` to the real public origin so the manifest's related-app URL and
   canonical metadata are correct.
3. Set `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` to enable consent-gated Firebase Analytics. Without it,
   the consent choice is still stored and no analytics loads.
4. When the privacy policy changes, increment `CONSENT_VERSION` in `lib/consent.ts` and update
   `CONSENT_POLICY_DATE`; existing customers are automatically re-prompted.
5. If the brand mark changes, update `scripts/generate-pwa-assets.mjs`, run `npm run assets:pwa`,
   and commit the regenerated icons/splashes. Bump `VERSION` in `public/sw.js` when replacing
   fixed-path public assets so caches refresh.
6. Test installation on Android Chrome (native prompt) and iOS Safari (Share → Add to Home Screen).
   The installed app must be launched from the home screen to verify the standalone state.

---

## 1. Quick start

```bash
npm install
cp .env.example .env.local     # fill in the values below
npm run dev                    # http://localhost:3000
```

The project is also a complete **portfolio demo**. When Realtime Database has no catalogue (or the
Admin service account is missing), the storefront serves a 27-dish sample menu, search, filters,
product detail, guest cart, demo checkout and simulated order tracking; the admin dashboard becomes
a fully interactive demo. See [Demo mode](#demo-mode). Live Firebase data always takes precedence.

---

## 2. Firebase setup

1. Create/open the Firebase project `untouch-returant`.
2. **Authentication → Sign-in method**: enable **Email/Password** and **Google**.
   Add `localhost` under **Authorized domains** for local development.
3. **Project settings → General → Your apps → Web app**: copy the config into
   `NEXT_PUBLIC_FIREBASE_*` variables (`.env.local`).
4. **Project settings → Service accounts → Generate new private key**: put the values into
   `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`
   (keep `\n` escapes on one line), or paste the whole JSON into
   `FIREBASE_SERVICE_ACCOUNT_JSON`.
5. **Realtime Database → Create database** and note the URL
   (`https://untouch-returant-default-rtdb.firebaseio.com`). It is already the default in
   `NEXT_PUBLIC_FIREBASE_DATABASE_URL` / `FIREBASE_ADMIN_DATABASE_URL`.
6. Deploy the security rules:

```bash
npx firebase-tools login
npx firebase-tools use untouch-returant
npx firebase-tools deploy --only database
```

> [`database.rules.json`](database.rules.json) is the security boundary. Catalogue reads are limited
> to published nodes, customers only see their own profile/addresses/cart/orders, and **orders are
> server-written only** — a browser can never create an order or change its total.

### Local emulator (optional)

```bash
npx firebase-tools emulators:start --only auth,database
# .env.local
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1:9099
```

Port `9099` serves Auth and `9000` serves Realtime Database; the client connects Auth to the host
above and Database to the same host on port `9000`. For server-side seeding without a service
account, export `FIREBASE_DATABASE_EMULATOR_HOST=127.0.0.1:9000` and `GCLOUD_PROJECT=untouch-returant`.

---

## 3. Seed the menu

```bash
npm run seed
```

Publishes 10 categories, 22 dishes (with variants, add-ons, offers), two promotional banners, two
coupons (`UNTOUCH10`, `WELCOME500`), restaurant settings and five approved reviews. Re-running is
idempotent — each node is written by a deterministic key, so repeat runs overwrite rather than
duplicate.

---

## 4. Admin access

The admin URL is `/unnothingadmin` and is `noindex` + excluded from `robots.txt`. Access is a
two-variable password setup checked **only on the server** — the password never reaches the browser
bundle, and there is no first-run bootstrap, Firebase custom claim or admin role in the database.

1. Set the panel password and a signing secret in `.env.local`:

   ```bash
   ADMIN_PANEL_PASSWORD=choose-a-strong-password
   ADMIN_SESSION_SECRET=$(openssl rand -hex 48)
   ```

2. Open `/unnothingadmin`. Without a valid session every dashboard page redirects to
   `/unnothingadmin/login` (including direct links such as `/unnothingadmin/orders`).
3. Sign in. The server compares the password in constant time, rate-limits failed attempts to five
   per ten minutes per IP, and sets `untouch_admin` — an HMAC-signed, HttpOnly, `SameSite=Lax`
   cookie that expires after eight hours. “Sign out” in the sidebar clears it.
4. Dashboard data and writes go through `/api/admin/data` and `/api/admin/orders/*`, both of which
   require the session and use the Firebase Admin SDK. Realtime Database rules therefore stay closed
   to unprivileged clients; the browser never writes protected nodes directly.

### Demo mode

UNTOUCH is safe to showcase without a configured Firebase Admin service account. Demo mode is
activated when the Realtime Database catalogue is empty and/or the Admin credentials are missing;
the moment real data exists, every surface reads Firebase instead.

**Customer experience**

- 27 sample dishes, 10 categories, offers, banners and approved reviews come from
  [`lib/demo/seed.ts`](lib/demo/seed.ts) — realistic PKR prices, local food photography and badges.
- Search, filters, sorting, product options/add-ons and the cart are fully interactive for guests.
- Checkout is a clearly labelled **demo checkout**: no payment is processed, no card is charged and
  the order is stored in this browser only.
- `/order/{number}` shows **simulated tracking** with a “Simulate next step” control; the same demo
  order can be advanced from the admin dashboard.
- A subtle “Demo showcase” strip appears under the homepage hero and a “demo menu” label on the menu.

**Admin dashboard**

- Sign in with `ADMIN_PANEL_PASSWORD` exactly as above; the session, route guard and rate limiting
  are unchanged.
- Products, categories, promotions (coupons + banners), reviews and orders can be created, edited,
  deleted and moderated. Order status, payment status and internal notes are editable.
- Every demo write is reported as saved **in this browser**, never as written to Firebase. A
  persistent banner and a “Demo mode” pill keep that explicit.
- Add the service-account variables (`FIREBASE_ADMIN_CLIENT_EMAIL` + `FIREBASE_ADMIN_PRIVATE_KEY`,
  or `FIREBASE_SERVICE_ACCOUNT_JSON`) and real catalogue data to switch to live mode.

**Storage & isolation**

- Demo data persists in `localStorage` under one namespaced key: `untouch.demo.v1`.
- Demo reads/writes never touch Firebase; live reads/writes never mutate the demo store.
- Demo data is per-browser. “Reset demo data” in **Admin → Restaurant** restores the sample seed.
- The Firebase Realtime Database rules are unchanged and remain closed to public writes.

---

## 5. Cloudinary

1. Create a Cloudinary product environment.
2. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (server only) and
   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` to `.env.local`.
3. Admin uploads call `POST /api/cloudinary/sign`, which returns a short-lived signature scoped to a
   folder. **The API secret never reaches the browser.**
4. Customer avatars use the same endpoint with `scope: "avatar"` (folder scoped to the user id).

---

## 6. Payments

- **Cash on delivery** is fully functional: orders are created with `paymentStatus: "unpaid"`, and
  staff update payment state from the admin panel.
- **Online payments are intentionally not configured.** No provider credentials exist, so the UI
  marks the option as *not connected* and the API rejects online orders with a clear message.

The integration surface lives in [`lib/payments.ts`](lib/payments.ts):

- `PaymentAdapter` (`initiate`, `verifyWebhook`, `isConfigured`)
- `POST /api/payments/initiate` — verifies the order belongs to the caller, then delegates to the
  adapter. Never marks an order paid.
- `POST /api/payments/webhook` — verifies an HMAC-SHA256 signature with `PAYMENT_WEBHOOK_SECRET`
  and only then updates `paymentStatus`.

To go live: implement a JazzCash / Easypaisa / Safepay adapter, set `PAYMENT_PROVIDER`,
`PAYMENT_MERCHANT_ID`, `PAYMENT_API_KEY`, `PAYMENT_API_SECRET`, `PAYMENT_INTEGRITY_SALT` and
`PAYMENT_WEBHOOK_SECRET`, then register the webhook URL with the provider.

---

## 7. Architecture

```
app/
  page.tsx                 Homepage (live catalogue sections)
  menu/                    Menu browser + product detail (SEO metadata via Admin SDK)
  categories/              Category index + per-category listing
  cart/ checkout/          Cart and multi-step checkout
  order/[orderNumber]/     Order tracking (live stream, or simulated demo tracking)
  account/                 Profile, addresses, orders, settings
  login|register|forgot-password/
  unnothingadmin/          Hidden admin panel (password session; login at /unnothingadmin/login)
  api/
    orders/                Server-side order creation (authoritative pricing)
    quote/                 Server-recomputed cart totals
    admin/login|logout/    Password sign-in, HttpOnly session cookie
    admin/data/            Session-guarded Realtime Database reads/writes
    admin/orders/[id]/     Status / payment / notes updates (admin session)
    cloudinary/sign/       Signed upload signature
    payments/              Provider-agnostic init + verified webhook
  sitemap.ts robots.ts icon.svg

components/  ui (primitives, motion, overlays) · layout · home · menu · cart · auth · account ·
             checkout · order · admin
lib/
  firebase/  client + admin singletons
  data/      Realtime Database helpers (catalog, user, admin)
  demo/      sample seed, localStorage demo store, demo-mode signal and admin bridge
  mappers.ts pure node → domain mappers shared by browser and server
  defaults.ts  neutral settings defaults (no "use client")
  server/    auth guards, order pricing, Cloudinary signing, SEO lookups
  pricing.ts shared money math (used on both sides; server wins)
  cart-store.ts  persistent Zustand cart
database.rules.json
scripts/     seed.ts, load-env.ts
```

### Money & integrity

- Prices live in whole PKR integers.
- The browser sends only `productId`, `quantity`, `variantId`, `addonIds` — never prices.
- `POST /api/orders` re-reads every product, re-applies variants/add-ons, revalidates coupons and
  the minimum order, recomputes delivery, and only then writes the order.
- Totals displayed before checkout come from `POST /api/quote`, which uses the same code path.

### Real-time surfaces

Products, categories, banners, settings, reviews, customer orders and admin dashboards all use
Realtime Database `onValue()` subscriptions, so admin edits and order status changes appear without
a refresh. Checkout writes go through the Admin SDK, which bypasses rules by design. In demo mode the
same surfaces subscribe to the browser-local demo store (via Zustand) instead — including
cross-tab sync through the `storage` event.

### Data model (`database.rules.json` mirrors this)

```
/products/{id}              catalogue (public: available === true only)
/categories/{id}            public: active === true only
/banners/{id}               public: active === true only
/restaurantSettings         public read, admin write
/reviews/{id}               public when status === "approved"; customers may create own pending review
/users/{uid}                owner + admin read/write
/addresses/{uid}/{id}       owner + admin
/carts/{uid}                owner (device-continuous cart mirror)
/orders/{id}                server-written only; browser reads denied (admin only)
/customerOrders/{uid}/{id}  server-written mirror the customer watches for live tracking
/coupons/{id}               admin only (server re-validates at checkout)
/newsletter/{id}            public append-only
/messages/{id}             public append-only contact form
```

---

## 8. Design system

- Ink (`#0a0908`) surfaces alternating with cream (`#f2ece1`) editorial sections.
- Ember (`#c4551f`) and saffron (`#e2b25d`) accents.
- Fraunces (display) / Inter (body) / IBM Plex Mono (labels).
- Motion: scroll reveals, word-level headline reveals, parallax images, magnetic buttons, pointer
  glow, animated cart count, scroll progress, drawer/modal transitions — all disabled under
  `prefers-reduced-motion`.

---

## 9. Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run assets:pwa` | Regenerate PWA icons and iOS launch images |
| `npm run seed` | Publish catalogue to Realtime Database |

---

## 10. Credits

**UNTOUCH** — Developed by Team Realhackers · Project Host: Haider Baloch
