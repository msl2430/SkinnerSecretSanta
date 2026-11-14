# Skinner Family Secret Santa (Vue 3 + Vite + Cloudflare Pages)

Pre-seeded with your exact **2026 exclusions** from `members_2026.json` and everyone's wishlists/sizes from `members_2025.json`.

## 1. Run Locally in VS Code or Visual Studio 2026

### Option A: VS Code (Recommended)
1. Open this folder in **VS Code**.
2. Open a terminal and run:
   ```bash
   npm install
   npm run dev
   ```
3. Your browser will open `http://localhost:5173`.
   - In local dev mode, all saves read/write directly to `data/santa-state.json` (no Cloudflare CLI needed!).
   - Use the **Local Dev Quick-Switch** bar on the login card to test signing in as `Mike (Admin)` or any of the 8 family members in one click.

### Option B: Visual Studio 2026
1. Double-click **`SkinnerSecretSanta.sln`**.
2. Press **F5** (or click **Start**), which automatically runs `npm install` / `npm run dev` and launches the app.

---

## 2. How to Deploy for Free on Cloudflare Pages (5 Minutes)

1. Push this project to a GitHub repository.
2. Log in to the **Cloudflare Dashboard** -> **Workers & Pages** -> **Create** -> **Pages** -> **Connect to Git**.
3. Select your repository and configure:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Bind Free Storage (Cloudflare KV):**
   - In Cloudflare Dashboard, go to **Storage & Databases -> KV** and click **Create a namespace** named `SANTA_KV`.
   - Inside your Cloudflare Pages project, go to **Settings -> Bindings -> Add -> KV Namespace**:
     - Variable name: `SANTA_KV`
     - KV Namespace: select `SANTA_KV`
5. **Add Free Email Sending (Resend or Mailgun):**
   - **Resend (Free 3,000 emails/mo):** Create a free account at [resend.com](https://resend.com), add your API key in Cloudflare Pages **Settings -> Environment Variables** as `RESEND_API_KEY`, and set `EMAIL_FROM` to `Skinner Secret Santa <santa@mikeslevine.com>`.
   - **Or reuse Mailgun:** Set `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` in Environment Variables.
