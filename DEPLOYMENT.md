# AVELORA - Production Deployment Guide

This guide details the complete, step-by-step procedure to deploy the **AVELORA** luxury e-commerce platform to production.

---

## 🏛️ Production Architecture Overview

```
                          ┌────────────────────────┐
                          │   Patrons / Visitors   │
                          └───────────┬────────────┘
                                      │
                                      ▼
                      ┌────────────────────────────────┐
                      │    Custom Domain & DNS         │
                      │    https://avelora.com         │
                      └───────────────┬────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
   ┌───────────────────────────┐             ┌───────────────────────────┐
   │  Frontend (Next.js 14)    │  REST APIs  │   Backend API (NestJS)    │
   │  Hosted on: Vercel        │◄───────────►│   Hosted on: Render/Railway│
   │  Domain: avelora.com      │ HttpOnly JWT│   Domain: api.avelora.com │
   └───────────────────────────┘             └─────────────┬─────────────┘
                                                           │
                                                           ▼
                                             ┌───────────────────────────┐
                                             │   Database: MongoDB Atlas │
                                             │   (Replica Set Cluster)   │
                                             └───────────────────────────┘
```

---

## Phase 1: Database Setup (MongoDB Atlas)

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster (Shared Free Tier M0 or Dedicated M10+).
3. **Database Access:**
   - Create a database user (e.g., `avelora_admin`) with read/write permissions.
   - Store the generated password securely.
4. **Network Access:**
   - Add IP Access: `0.0.0.0/0` (Allow access from anywhere, required for dynamic cloud hosting like Render/Railway).
5. **Get Connection String:**
   - Click **Connect** $\rightarrow$ **Drivers** (Node.js).
   - Copy the URI:
     ```env
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/avelora_prod?retryWrites=true&w=majority
     ```

---

## Phase 2: Backend API Deployment (Render or Railway)

### Option A: Render.com (Recommended)

1. Push your repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com/) $\rightarrow$ **New** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Name:** `avelora-api`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Health Check Path:** `/health`
5. **Environment Variables:**
   | Variable | Example Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production optimizations & secure cookies |
   | `PORT` | `3001` (or leave default assigned by Render) | Listening port |
   | `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
   | `JWT_SECRET` | *(Generate 32-byte secret)* | Secret key for signing JWT tokens |
   | `FRONTEND_URL` | `https://avelora.com,https://www.avelora.com` | Allowed CORS origins |
   | `COOKIE_SECURE` | `true` | Enforces HTTPS-only cookies |
   | `COOKIE_SAME_SITE` | `lax` | Subdomain cookie sharing |
   | `COOKIE_DOMAIN` | `.avelora.com` | Root domain for cookie sharing (if custom domain attached) |
   | `INITIAL_ADMIN_EMAIL` | `admin@avelora.com` | Initial super admin email |
   | `INITIAL_ADMIN_PASSWORD` | *(Your secure admin password)* | Initial super admin password |
   | `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` *(Optional)* | Media CDN |
   | `CLOUDINARY_API_KEY` | `your_api_key` *(Optional)* | Media CDN Key |
   | `CLOUDINARY_API_SECRET` | `your_api_secret` *(Optional)* | Media CDN Secret |

6. Deploy the service and note your live API URL (e.g., `https://avelora-api.onrender.com` or custom `https://api.avelora.com`).

---

## Phase 3: Frontend Storefront Deployment (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/) $\rightarrow$ **Add New Project**.
2. Import the same GitHub repository.
3. Configure project settings:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
4. **Environment Variables:**
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://api.avelora.com` (or `https://avelora-api.onrender.com`) | Backend Gateway URL (No trailing slash) |
   | `NEXT_PUBLIC_SITE_URL` | `https://avelora.com` | Storefront Canonical Base URL |

5. Click **Deploy**. Vercel will build and assign a deployment URL (e.g., `https://avelora.vercel.app`).

---

## Phase 4: Custom Domain & DNS Mapping

To connect `avelora.com` and `api.avelora.com`:

1. **Frontend (Vercel):**
   - In Vercel Project Settings $\rightarrow$ **Domains**:
   - Add `avelora.com` and `www.avelora.com`.
   - In your DNS Registrar (Namecheap/Cloudflare/GoDaddy):
     - `A Record`: `@` $\rightarrow$ `76.76.21.21` (Vercel IP)
     - `CNAME Record`: `www` $\rightarrow$ `cname.vercel-dns.com`

2. **Backend (Render/Railway):**
   - In Render Web Service $\rightarrow$ **Settings** $\rightarrow$ **Custom Domains**:
   - Add `api.avelora.com`.
   - In your DNS Registrar:
     - `CNAME Record`: `api` $\rightarrow$ `avelora-api.onrender.com`

3. **Verify Cookie & CORS Alignment:**
   - When using `avelora.com` (frontend) and `api.avelora.com` (backend), set in Backend:
     - `COOKIE_DOMAIN=.avelora.com`
     - `COOKIE_SAME_SITE=lax`
     - `COOKIE_SECURE=true`
     - `FRONTEND_URL=https://avelora.com,https://www.avelora.com`

---

## Phase 5: Production Admin Access & Verification

1. Navigate to: `https://avelora.com/admin/login`
2. Sign in with the configured `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD`.
3. Verify the browser receives the `token` cookie with flags: `HttpOnly; Secure; SameSite=Lax; Domain=.avelora.com`.
4. Verify redirection to `https://avelora.com/admin/dashboard`.
5. Refresh the page to verify persistent session.
6. Click **Sign Out** to verify the cookie is invalidated and you are redirected to `/admin/login`.

---

## Phase 6: Google Search Console & SEO Verification

1. **Verify Canonical Endpoints:**
   - Sitemap URL: `https://avelora.com/sitemap.xml`
   - Robots URL: `https://avelora.com/robots.txt`
2. **Google Search Console (GSC):**
   - Go to [Google Search Console](https://search.google.com/search-console).
   - Add property: `https://avelora.com` (URL prefix or Domain via DNS TXT record).
   - Once verified, go to **Sitemaps** $\rightarrow$ Submit `sitemap.xml`.
   - Request indexing for high-priority pages (`/`, `/products`, etc.).
