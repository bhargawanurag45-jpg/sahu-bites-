# Sahu Bites — Pure Veg Restaurant Website

A complete restaurant ordering website: customers order from their table,
staff see live kitchen tickets, and the admin manages the menu — all
synced in real time (via Firebase) across every device.

- **PIN — Staff Dashboard:** `1`
- **PIN — Admin Panel:** `9999`
- **Table QR links:** `https://your-site-name.vercel.app/?table=1` (change the
  number 1–10 for each table)

The Firebase database is already connected and working — you do not need
to set anything up there. This project is 100% free to run and host.

---

## 1. How to upload this to GitHub (from your phone)

1. Go to **github.com**, sign up / log in (free).
2. Tap the **"+"** icon (top right) → **"New repository"**.
3. Name it `sahu-bites` → tap **"Create repository"**.
4. On the new repo page, tap **"uploading an existing file"**.
5. From your phone, select **all the files and folders** inside this ZIP
   (after unzipping it — see step 0 below) and upload them.
6. Scroll down, tap **"Commit changes"**.

**Step 0 — Unzip first:** Most phones can't upload a ZIP directly as a
project. Use any free "Unzip / File Manager" app (like "ZArchiver" on
Android, or the built-in Files app on iPhone) to extract the ZIP first,
then upload the extracted folder's contents in step 5.

---

## 2. How to deploy on Vercel (from your phone) — free

1. Go to **vercel.com**, tap **"Sign Up"**, choose **"Continue with GitHub"**
   (this links your GitHub account — easiest option).
2. On your Vercel dashboard, tap **"Add New..." → "Project"**.
3. Find your **`sahu-bites`** repository in the list → tap **"Import"**.
4. Vercel will auto-detect it's a **Vite** project — leave all settings
   as default.
5. Tap **"Deploy"**.
6. Wait ~1 minute. You'll get a live link like:
   `https://sahu-bites-xyz.vercel.app`

That link is your real, permanent, free website. Share it, or use it to
generate table QR codes (see below).

**Every time you want to update the site later:** just upload the
changed file to GitHub again — Vercel automatically redeploys within a
minute.

---

## 3. Generating table QR codes

Once you have your Vercel link, create one QR code per table pointing to:

```
https://your-site-name.vercel.app/?table=1
https://your-site-name.vercel.app/?table=2
...
https://your-site-name.vercel.app/?table=10
```

Use any free QR generator like **qr-code-generator.com** or **me-qr.com**
— paste the link, download the QR image, print it, and place it on each
table. Scanning it opens the menu with that table already selected.

---

## 4. Connecting a custom domain later (optional)

If you later buy a domain (e.g. `sahubites.com` — usually ₹700–900/year
from Hostinger, GoDaddy, or Namecheap):

1. On Vercel, open your project → **"Settings" → "Domains"**.
2. Type your domain name → tap **"Add"**.
3. Vercel will show 1–2 DNS records (an "A" record and/or "CNAME").
4. Go to wherever you bought the domain → find **"DNS settings"** →
   add the exact records Vercel showed you.
5. Wait 10 minutes to a few hours for it to activate (Vercel will show
   a green checkmark when it's ready).

Your hosting stays free forever — you only ever pay for the domain name
itself, if you choose to get one.

---

## Running it on a computer (optional, only if you have one)

```bash
npm install
npm run dev
```

Then open the link it shows (usually `http://localhost:5173`).

To build for production manually:

```bash
npm run build
```

---

## What's inside

```
sahu-bites/
├── index.html          ← page shell
├── package.json         ← dependencies list
├── vite.config.js        ← build tool config
├── src/
│   ├── main.jsx          ← mounts the app
│   ├── App.jsx            ← the entire website (menu, cart, staff, admin)
│   └── firebase.js         ← real-time database connection
```

## Editing the menu after launch

You don't need to touch any code to add/remove menu items — use the
**Admin Panel** (PIN `9999`) directly on the live website. Changes save
instantly and sync to every device.
