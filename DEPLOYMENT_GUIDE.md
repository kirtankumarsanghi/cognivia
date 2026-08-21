# 🚀 Cognivia Deployment Guide

**Complete guide to deploy Cognivia to production on popular hosting platforms**

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Platform Options](#platform-options)
3. [Option 1: Vercel (Frontend) + Render (Backend)](#option-1-vercel-frontend--render-backend) ⭐ **Recommended**
4. [Option 2: Netlify (Frontend) + Railway (Backend)](#option-2-netlify-frontend--railway-backend)
5. [Option 3: Full Stack on Render](#option-3-full-stack-on-render)
6. [Post-Deployment](#post-deployment)
7. [Custom Domain Setup](#custom-domain-setup)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🎯 Pre-Deployment Checklist

Before deploying, ensure you have:

### ✅ 1. Supabase Database Ready
- [ ] Supabase project created
- [ ] `schema.sql` executed successfully
- [ ] `seed.sql` executed (optional but recommended)
- [ ] Credentials saved:
  - Project URL
  - Anon/Public Key
  - Service Role Key

### ✅ 2. Gemini API Key (Optional)
- [ ] Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] AI tutoring features require this
- [ ] Demo mode works without it

### ✅ 3. Code Repository
- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] All sensitive data removed from code
- [ ] `.env` files in `.gitignore`

### ✅ 4. Environment Variables Documented
```env
# Backend needs:
PORT=5000
FRONTEND_URL=https://your-frontend-url.com
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key (optional)

# Frontend needs:
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend-url.com/api
```

### ✅ 5. Build Test Locally
```bash
# Test backend build
cd backend
npm install
npm run build
npm start

# Test frontend build
cd frontend
npm install
npm run build
npm run preview
```

All builds must succeed before deployment!

---

## 🌐 Platform Options

| Platform | Best For | Free Tier | Pros | Cons |
|----------|----------|-----------|------|------|
| **Vercel** | Frontend | ✅ Yes | Fast CDN, auto-deployments, zero config | Backend needs separate hosting |
| **Render** | Backend/Full Stack | ✅ Yes | Easy setup, auto-deploy, free SSL | Free tier sleeps after inactivity |
| **Netlify** | Frontend | ✅ Yes | Great DX, form handling | Backend functions limited |
| **Railway** | Backend | ⚠️ $5 credit | No sleep, fast deploys | Requires credit card |
| **Heroku** | Full Stack | ❌ Paid only | Mature platform | No free tier anymore |

**Our Recommendation:** Vercel (Frontend) + Render (Backend) - Best free tier combination!

---

## ⭐ Option 1: Vercel (Frontend) + Render (Backend)

**Total Cost:** Free
**Setup Time:** 15-20 minutes
**Difficulty:** Easy

### Step 1: Deploy Backend to Render

#### 1.1. Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended) or email
3. Verify your email

#### 1.2. Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your repository
4. Configure:
   - **Name:** `cognivia-backend` (or your preferred name)
   - **Region:** Choose closest to your users
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

#### 1.3. Add Environment Variables
In the **Environment** section, add:

```
PORT=5000
FRONTEND_URL=https://your-app.vercel.app
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
NODE_ENV=production
```

⚠️ **Important:** 
- Keep `FRONTEND_URL` blank for now, we'll update it after deploying frontend
- Use your actual Supabase credentials
- GEMINI_API_KEY is optional

#### 1.4. Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for first deploy
3. You'll see build logs in real-time
4. When done, you'll see: **"Your service is live at https://cognivia-backend-xxxx.onrender.com"**

#### 1.5. Test Backend
Open in browser: `https://your-backend-url.onrender.com/api/health`

Should see:
```json
{"status":"ok","timestamp":"2026-08-22T..."}
```

✅ **Backend deployed!** Copy your backend URL for next step.

⚠️ **Free Tier Note:** Render free tier sleeps after 15 minutes of inactivity. First request after sleep takes 30-60 seconds. Paid tier ($7/month) keeps it always on.

---

### Step 2: Deploy Frontend to Vercel

#### 2.1. Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your repositories

#### 2.2. Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your repository
3. Vercel auto-detects Vite configuration
4. Configure:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `dist` (auto-filled)

#### 2.3. Add Environment Variables
Click **"Environment Variables"** and add:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_API_URL=https://your-backend-url.onrender.com/api
```

⚠️ **Critical:**
- Use `VITE_SUPABASE_ANON_KEY` (NOT service_role key!)
- Replace `your-backend-url.onrender.com` with your actual Render URL from Step 1

#### 2.4. Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. You'll see: **"Congratulations! Your project is live at https://your-app.vercel.app"**

#### 2.5. Update Backend CORS
Now that you have your frontend URL, go back to Render:

1. Go to your Render dashboard
2. Click on your backend service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` to: `https://your-app.vercel.app`
5. Save changes (auto-redeploys)

#### 2.6. Test Application
1. Open your Vercel URL: `https://your-app.vercel.app`
2. Click **"Get Started"**
3. Try Demo Mode → Should load dashboard with data
4. Try Sign Up → Should create new account

✅ **Full application deployed!**

---

### Step 3: Enable Auto-Deployments

**Vercel (Frontend):**
- ✅ Already enabled by default
- Every push to `main` branch auto-deploys
- Preview deployments for pull requests

**Render (Backend):**
- ✅ Already enabled by default
- Every push to `main` branch auto-deploys
- See deployment logs in dashboard

**Workflow:**
```bash
# Make changes locally
git add .
git commit -m "feat: add new feature"
git push origin main

# Automatic:
# → GitHub receives push
# → Render starts backend build
# → Vercel starts frontend build
# → Both deploy automatically (3-5 min)
```

---

## 🎨 Option 2: Netlify (Frontend) + Railway (Backend)

**Total Cost:** Free ($5 Railway credit included)
**Setup Time:** 20 minutes
**Difficulty:** Easy

### Step 1: Deploy Backend to Railway

#### 1.1. Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Accept terms

#### 1.2. Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select your repository
4. Railway detects Node.js project

#### 1.3. Configure Service
1. Select **backend** directory
2. Click on your service
3. Go to **Settings** tab
4. Set:
   - **Root Directory:** `/backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

#### 1.4. Add Environment Variables
Click **Variables** tab and add:

```
PORT=5000
FRONTEND_URL=https://your-netlify-app.netlify.app
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
NODE_ENV=production
```

#### 1.5. Generate Domain
1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. You'll get: `https://cognivia-backend-production.up.railway.app`

#### 1.6. Deploy
Railway auto-deploys. Check **Deployments** tab for status.

✅ **Backend deployed!** Copy your Railway URL.

---

### Step 2: Deploy Frontend to Netlify

#### 2.1. Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Authorize Netlify

#### 2.2. Import Project
1. Click **"Add new site"** → **"Import an existing project"**
2. Connect to GitHub
3. Select your repository
4. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`

#### 2.3. Add Environment Variables
Click **"Site settings"** → **"Environment variables"**:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend.up.railway.app/api
```

#### 2.4. Deploy
1. Click **"Deploy site"**
2. Wait 2-3 minutes
3. You'll get: `https://random-name-123456.netlify.app`

#### 2.5. Customize Domain (Optional)
1. Go to **Site settings** → **Domain management**
2. Click **"Options"** → **"Edit site name"**
3. Change to: `cognivia-app` → `https://cognivia-app.netlify.app`

#### 2.6. Update Backend CORS
Go back to Railway and update `FRONTEND_URL` to your Netlify URL.

✅ **Full application deployed!**

---

## 🔧 Option 3: Full Stack on Render

**Total Cost:** Free (with limitations)
**Setup Time:** 25 minutes
**Difficulty:** Medium

Deploy both frontend and backend on Render.

### Step 1: Deploy Backend (Same as Option 1)

Follow **Option 1, Step 1** above.

### Step 2: Deploy Frontend Static Site

#### 2.1. Create Static Site
1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect repository
3. Configure:
   - **Name:** `cognivia-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

#### 2.2. Add Environment Variables
Add in **Environment** section:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://cognivia-backend-xxxx.onrender.com/api
```

#### 2.3. Deploy
1. Click **"Create Static Site"**
2. Wait 2-3 minutes
3. You'll get: `https://cognivia-frontend-xxxx.onrender.com`

#### 2.4. Update Backend CORS
Update backend `FRONTEND_URL` to: `https://cognivia-frontend-xxxx.onrender.com`

✅ **Both services on Render!**

**Pros:** Everything in one platform
**Cons:** Both services sleep on free tier (30-60s wake time)

---

## ✅ Post-Deployment

### Test Your Deployment

#### 1. Backend Health Check
Open: `https://your-backend-url/api/health`

**Expected:**
```json
{"status":"ok","timestamp":"2026-08-22T..."}
```

#### 2. Frontend Loads
Open: `https://your-frontend-url`

**Expected:**
- Landing page loads
- Animations work
- No console errors (F12)

#### 3. Database Connection
1. Click **"Get Started"** → **"Student"** → **"Sign Up"**
2. Create account
3. Should redirect to dashboard
4. Check Supabase → Authentication → Users → New user appears

#### 4. API Integration
1. In dashboard, try **"I'm Confused"** button
2. Submit confusion signal
3. Should see success message
4. Check Render logs → Should show API request

#### 5. AI Features (If GEMINI_API_KEY set)
1. Open AI Tutor
2. Ask a question
3. Should get real AI response (not demo)

---

### Update DNS Records (If using custom domain)

See [Custom Domain Setup](#custom-domain-setup) section below.

---

### Enable HTTPS (Already done automatically)

All platforms (Vercel, Netlify, Render, Railway) provide free SSL certificates automatically. Your URLs already use HTTPS!

---

### Set Up Monitoring

#### Option A: Built-in Platform Monitoring

**Vercel:**
- Dashboard → Analytics (free)
- See page views, performance
- Error tracking

**Render:**
- Dashboard → Metrics
- CPU, Memory usage
- Request logs

**Netlify:**
- Analytics tab
- Bandwidth, page views
- Form submissions

#### Option B: External Monitoring (Recommended for production)

**Uptime Monitoring:**

1. [UptimeRobot](https://uptimerobot.com) (Free)
   - Monitor up to 50 URLs
   - Email alerts when down
   - 5-minute checks

   **Setup:**
   ```
   Monitor 1: https://your-backend-url/api/health (GET)
   Monitor 2: https://your-frontend-url (GET)
   Alert contacts: your-email@example.com
   ```

**Error Tracking:**

2. [Sentry](https://sentry.io) (Free tier: 5K events/month)
   
   **Backend setup:**
   ```bash
   cd backend
   npm install @sentry/node
   ```

   ```typescript
   // backend/src/server.ts
   import * as Sentry from "@sentry/node";

   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: process.env.NODE_ENV
   });

   // Add before routes
   app.use(Sentry.Handlers.requestHandler());
   
   // Add after routes but before error handlers
   app.use(Sentry.Handlers.errorHandler());
   ```

   **Frontend setup:**
   ```bash
   cd frontend
   npm install @sentry/react
   ```

   ```typescript
   // frontend/src/main.tsx
   import * as Sentry from "@sentry/react";

   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: import.meta.env.MODE
   });
   ```

**Performance Monitoring:**

3. [LogRocket](https://logrocket.com) (Free: 1,000 sessions/month)
   - Session replay
   - Performance tracking
   - User analytics

---

## 🌍 Custom Domain Setup

### Prerequisites
- Own a domain (from Namecheap, GoDaddy, Google Domains, etc.)
- Access to DNS settings

---

### Vercel Custom Domain

#### 1. Add Domain in Vercel
1. Go to your project → **Settings** → **Domains**
2. Enter your domain: `app.yourdomain.com` or `yourdomain.com`
3. Click **"Add"**

#### 2. Configure DNS
Vercel shows DNS records to add. In your domain registrar:

**For subdomain (app.yourdomain.com):**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 3600
```

**For root domain (yourdomain.com):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

#### 3. Wait for Propagation
- DNS changes take 5 minutes to 48 hours
- Vercel auto-issues SSL certificate when DNS is ready
- Check status in Vercel dashboard

✅ Your app is now at `https://yourdomain.com`!

---

### Netlify Custom Domain

#### 1. Add Domain
1. **Site settings** → **Domain management**
2. Click **"Add domain alias"**
3. Enter: `app.yourdomain.com`

#### 2. Configure DNS
Netlify shows required records:

```
Type: CNAME
Name: app
Value: your-site.netlify.app
TTL: 3600
```

#### 3. Enable HTTPS
Netlify auto-provisions SSL. Click **"Verify DNS configuration"** when ready.

---

### Render Custom Domain

#### 1. Add Domain
1. Service dashboard → **Settings** → **Custom Domain**
2. Click **"Add Custom Domain"**
3. Enter: `api.yourdomain.com` (for backend)

#### 2. Configure DNS
```
Type: CNAME
Name: api
Value: your-service.onrender.com
TTL: 3600
```

#### 3. Verify
Click **"Verify"** in Render. SSL auto-provisions.

---

### Railway Custom Domain

#### 1. Add Domain
1. Service → **Settings** → **Networking** → **Custom Domain**
2. Enter: `api.yourdomain.com`

#### 2. Configure DNS
```
Type: CNAME
Name: api
Value: your-service.up.railway.app
TTL: 3600
```

#### 3. Verify
Railway verifies automatically. Check **Domains** tab for status.

---

### Update Environment Variables After Custom Domain

**Important:** Update CORS and API URLs!

**Backend (on Render/Railway):**
```env
FRONTEND_URL=https://yourdomain.com
```

**Frontend (on Vercel/Netlify):**
```env
VITE_API_URL=https://api.yourdomain.com/api
```

Redeploy both services after updating!

---

## 📊 Monitoring & Maintenance

### Daily Checks

**Automated (Set up UptimeRobot):**
- ✅ Backend health endpoint responding
- ✅ Frontend loading correctly
- ✅ SSL certificate valid

**Manual (5 minutes/day):**
- Check error logs in platform dashboard
- Review Sentry errors (if set up)
- Monitor Supabase usage (Dashboard → Settings → Billing)

---

### Weekly Maintenance

**Review Metrics:**
- Platform analytics (page views, bandwidth)
- Supabase row counts (ensure not hitting limits)
- API response times
- Error rates

**Free Tier Limits:**

| Platform | Limit | What Happens |
|----------|-------|--------------|
| **Vercel** | 100 GB bandwidth/month | Site pauses until next month |
| **Render** | 750 hours/month | Service stops (plenty for 1 app) |
| **Netlify** | 100 GB bandwidth/month | Site pauses |
| **Supabase** | 500 MB database, 2 GB bandwidth | Paused or charged |
| **Railway** | $5 credit/month | Service stops when credit exhausted |

**Monitor Supabase Usage:**
1. Supabase Dashboard → Settings → Billing
2. Check: Database size, API requests, bandwidth
3. Free tier: 500 MB database, 2 GB bandwidth, 50K monthly active users

---

### Monthly Tasks

**Update Dependencies:**
```bash
# Backend
cd backend
npm outdated
npm update
npm audit fix
npm run build
npm test

# Frontend
cd frontend
npm outdated
npm update
npm audit fix
npm run build

# Commit and push (triggers auto-deploy)
git add .
git commit -m "chore: update dependencies"
git push
```

**Review Logs:**
- Platform logs for errors
- Supabase logs (Dashboard → Logs)
- Identify and fix recurring issues

**Database Maintenance:**
```sql
-- In Supabase SQL Editor
-- Check table sizes
SELECT 
  schemaname as schema,
  tablename as table,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Clean old confusion signals (optional, keep last 90 days)
DELETE FROM confusion_signals 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Vacuum database (reclaim space)
VACUUM ANALYZE;
```

---

### Backup Strategy

**Supabase Auto-Backups:**
- Free tier: Daily backups, 7-day retention
- Pro tier: Point-in-time recovery

**Manual Backup:**
```bash
# Export database via Supabase CLI (install first)
supabase db dump -f backup.sql

# Or export specific tables via SQL:
COPY (SELECT * FROM profiles) TO 'profiles.csv' CSV HEADER;
COPY (SELECT * FROM courses) TO 'courses.csv' CSV HEADER;
```

**Schedule:** Weekly manual exports stored securely

---

### Scaling Up (When needed)

**Signs you need to upgrade:**
- Free tier limits being hit
- Backend wakes slowly (Render free tier sleeps)
- High traffic (>100K requests/day)
- Need better performance

**Upgrade Path:**

1. **Render Pro:** $7/month
   - No sleeping
   - Always fast
   - Better resources

2. **Vercel Pro:** $20/month
   - More bandwidth (1 TB)
   - Advanced analytics
   - Priority support

3. **Supabase Pro:** $25/month
   - 8 GB database
   - 250 GB bandwidth
   - Better performance
   - Point-in-time recovery

4. **Railway:** ~$5-20/month (usage-based)
   - No sleeping
   - Reliable
   - Autoscaling

**Total recommended for production:** ~$40-60/month for all services

---

## 🚨 Troubleshooting Deployment

### Backend Issues

#### ❌ "Application failed to respond"
**Cause:** Wrong start command or port

**Fix:**
1. Check `package.json` scripts → `start` must be: `node dist/server.js`
2. Check environment variable `PORT` is set
3. Ensure build step succeeded (`npm run build`)

---

#### ❌ "Cannot find module"
**Cause:** Dependencies not installed or wrong working directory

**Fix:**
1. Ensure **Root Directory** is set to `backend` (not blank)
2. Build command includes `npm install`
3. Check `package.json` is in backend folder

---

#### ❌ "Supabase connection failed"
**Cause:** Wrong credentials or network issues

**Fix:**
1. Double-check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
2. Test URL: `curl https://your-project.supabase.co/rest/v1/` (should return API docs)
3. Ensure service_role key (not anon key) in backend

---

### Frontend Issues

#### ❌ Blank page after deployment
**Cause:** Environment variables not set or build failed

**Fix:**
1. Check build logs for errors
2. Ensure all `VITE_*` environment variables are set
3. Variables must start with `VITE_` for Vite
4. Redeploy after adding variables

---

#### ❌ API requests fail (CORS error)
**Cause:** Backend FRONTEND_URL not matching actual frontend URL

**Fix:**
1. In backend environment variables, update:
   ```
   FRONTEND_URL=https://your-actual-frontend-url.com
   ```
2. No trailing slash!
3. Must match exactly (https required in production)
4. Redeploy backend after change

---

#### ❌ "Failed to fetch" errors
**Cause:** Wrong API URL or backend not running

**Fix:**
1. Check `VITE_API_URL` in frontend:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```
2. Ensure backend is running (check platform dashboard)
3. Test backend health: `https://your-backend-url.com/api/health`

---

### Platform-Specific Issues

#### Render: "Service exited"
**Cause:** Application crash

**Fix:**
1. Check **Logs** tab for error message
2. Common: Missing environment variable
3. Test locally first: `npm run build && npm start`

---

#### Vercel: "Serverless Function has timed out"
**Cause:** Function running too long (10s limit)

**Note:** Doesn't apply to our setup (we use separate backend)

---

#### Netlify: "Page Not Found" on refresh
**Cause:** React Router needs redirect rules

**Fix:**
Create `frontend/public/_redirects`:
```
/*    /index.html   200
```

Redeploy. All routes now work!

---

#### Railway: "Out of credits"
**Cause:** $5 monthly credit exhausted

**Fix:**
1. Add payment method to continue
2. Or migrate to Render free tier (has sleeping)
3. Monitor usage: Railway Dashboard → Usage

---

## 📝 Deployment Checklist

Use this before going live:

### Pre-Launch Checklist

- [ ] **Database**
  - [ ] Schema applied
  - [ ] Seed data added (optional)
  - [ ] Backups enabled
  
- [ ] **Backend**
  - [ ] Builds successfully locally
  - [ ] All environment variables set
  - [ ] Health endpoint responding
  - [ ] CORS configured correctly
  
- [ ] **Frontend**
  - [ ] Builds successfully locally
  - [ ] All environment variables set (VITE_ prefix)
  - [ ] API URL pointing to production backend
  - [ ] Using ANON key (not service_role)
  
- [ ] **Security**
  - [ ] No API keys in code
  - [ ] `.env` files in `.gitignore`
  - [ ] HTTPS enabled (auto on all platforms)
  - [ ] CORS only allows your frontend
  
- [ ] **Testing**
  - [ ] Landing page loads
  - [ ] Sign up/login works
  - [ ] Dashboard displays data
  - [ ] API calls succeed
  - [ ] No console errors
  
- [ ] **Monitoring**
  - [ ] Uptime monitoring configured
  - [ ] Error tracking set up (optional)
  - [ ] Analytics enabled
  
- [ ] **Documentation**
  - [ ] Deployment URLs documented
  - [ ] Environment variables documented
  - [ ] Access credentials stored securely
  
- [ ] **Team**
  - [ ] Team members have platform access
  - [ ] Deployment process documented
  - [ ] Rollback plan ready

---

## 🎉 Success!

Your Cognivia application is now live in production!

**What's Next?**

1. **Share with users** - Send them your production URL
2. **Monitor health** - Set up UptimeRobot for alerts
3. **Collect feedback** - Use analytics to see usage patterns
4. **Iterate** - Make improvements based on user feedback
5. **Scale** - Upgrade tiers when you outgrow free limits

**Resources:**
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Railway Docs](https://docs.railway.app)
- [Supabase Docs](https://supabase.com/docs)

**Need Help?**
- Platform support (check each platform's docs/support)
- Supabase Discord: [discord.gg/supabase](https://discord.gg/supabase)
- Vercel Discord: [vercel.com/discord](https://vercel.com/discord)

---

**Congratulations on deploying Cognivia! 🚀🎊**
