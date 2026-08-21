# ⚡ Quick Deploy - Cognivia in 10 Minutes

**Fast-track deployment guide. Follow these steps in order.**

---

## 🎯 What You'll Deploy

- **Frontend:** Vercel (Free, Fast CDN)
- **Backend:** Render (Free tier)
- **Database:** Supabase (Already set up)

**Total Cost:** $0/month
**Total Time:** 10-15 minutes

---

## 📝 Before You Start

**You Need:**
1. ✅ GitHub account
2. ✅ Your code pushed to GitHub repository
3. ✅ Supabase project with schema and seed data loaded
4. ✅ Supabase credentials ready:
   - Project URL
   - Anon key
   - Service role key

**Don't have Supabase set up yet?** See `SETUP_GUIDE.md` → Database Setup section.

---

## 🚀 Step 1: Deploy Backend (5 minutes)

### 1. Go to Render
👉 [https://render.com](https://render.com)

### 2. Sign Up
- Click **"Get Started"**
- Choose **"Sign in with GitHub"**
- Authorize Render

### 3. New Web Service
- Click **"New +"** → **"Web Service"**
- Click **"Connect account"** for GitHub
- Authorize access to your repository
- Find and select your `cognivia` repository

### 4. Configure

Copy these settings exactly:

```
Name: cognivia-backend
Region: [Your closest region]
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
Instance Type: Free
```

### 5. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these **one by one**:

```
PORT
5000

FRONTEND_URL
https://temp.vercel.app

SUPABASE_URL
[Your Supabase project URL]

SUPABASE_SERVICE_ROLE_KEY
[Your service role key]

GEMINI_API_KEY
[Your Gemini key - Optional, leave blank if you don't have one]

NODE_ENV
production
```

⚠️ **For FRONTEND_URL:** Use `https://temp.vercel.app` for now. We'll update this after deploying frontend.

### 6. Create Service
- Click **"Create Web Service"**
- Wait 3-5 minutes (watch the logs)
- When you see "Your service is live" - **COPY YOUR URL**

Example: `https://cognivia-backend-xxxx.onrender.com`

### 7. Test It
Open in browser: `https://your-backend-url.onrender.com/api/health`

Should see:
```json
{"status":"ok","timestamp":"..."}
```

✅ **Backend is live!** Keep this URL handy.

---

## 🎨 Step 2: Deploy Frontend (5 minutes)

### 1. Go to Vercel
👉 [https://vercel.com](https://vercel.com)

### 2. Sign Up
- Click **"Sign Up"**
- Choose **"Continue with GitHub"**
- Authorize Vercel

### 3. Import Project
- Click **"Add New..."** → **"Project"**
- Find your `cognivia` repository
- Click **"Import"**

### 4. Configure

Vercel auto-detects Vite. Update these:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

### 5. Add Environment Variables

Click **"Environment Variables"**

Add these **one by one**:

```
VITE_SUPABASE_URL
[Your Supabase project URL]

VITE_SUPABASE_ANON_KEY
[Your Supabase ANON key - NOT service role!]

VITE_API_URL
[Your Render backend URL]/api
```

⚠️ **Example for VITE_API_URL:** 
```
https://cognivia-backend-xxxx.onrender.com/api
```

### 6. Deploy
- Click **"Deploy"**
- Wait 2-3 minutes
- When done, click **"Visit"** or copy your URL

Example: `https://cognivia-app-xxxx.vercel.app`

### 7. Test It
- Open your Vercel URL
- Should see landing page
- Click **"Get Started"** → **"Student"**
- Should load demo dashboard

✅ **Frontend is live!**

---

## 🔄 Step 3: Update Backend CORS (2 minutes)

**Important:** Update backend to allow your frontend URL

### 1. Go to Render Dashboard
👉 [https://dashboard.render.com](https://dashboard.render.com)

### 2. Select Your Backend Service
Click on `cognivia-backend`

### 3. Update Environment Variable
- Click **"Environment"** in left sidebar
- Find `FRONTEND_URL`
- Click **"Edit"** (pencil icon)
- Change from `https://temp.vercel.app` to **your actual Vercel URL**

Example:
```
FRONTEND_URL=https://cognivia-app-xxxx.vercel.app
```

⚠️ **Important:** 
- Use your actual Vercel URL (the one you got in Step 2)
- No trailing slash!
- Must include `https://`

### 4. Save
- Click **"Save Changes"**
- Render auto-redeploys (takes 2-3 minutes)
- Wait for "Live" status

---

## ✅ Step 4: Final Test (1 minute)

### Test Everything Works:

1. **Open your frontend** (Vercel URL)
2. Click **"Get Started"** → **"Student"** → **"Sign Up"**
3. **Create a test account:**
   ```
   Name: Test Student
   Email: test@example.com
   Password: Test123!
   ```
4. Should redirect to dashboard
5. Try **"I'm Confused"** button → Submit
6. Should see success message

✅ **Everything working? Congratulations! Your app is live! 🎉**

---

## 📝 Save These URLs

**Write these down for your records:**

```
Frontend URL: https://your-app.vercel.app
Backend URL: https://your-backend.onrender.com
Supabase URL: https://your-project.supabase.co

Vercel Dashboard: https://vercel.com/dashboard
Render Dashboard: https://dashboard.render.com
Supabase Dashboard: https://supabase.com/dashboard
```

---

## 🎯 What's Next?

### Enable Auto-Deployments
**Already done!** 

Every time you push to GitHub:
```bash
git add .
git commit -m "update: new feature"
git push origin main
```

Both Vercel and Render automatically deploy! (3-5 min)

### Custom Domain (Optional)
Own a domain? See `DEPLOYMENT_GUIDE.md` → Custom Domain Setup

### Monitoring
Set up free monitoring:
1. **UptimeRobot** - Get alerts when your site goes down
   👉 [https://uptimerobot.com](https://uptimerobot.com)
   
2. **Vercel Analytics** - Already enabled in dashboard
   
3. **Render Metrics** - Check in Render dashboard

---

## 🐛 Quick Troubleshooting

### Backend shows "Service exited"
**Fix:** Check Render logs → Usually missing environment variable

### Frontend shows blank page
**Fix:** 
1. Press F12 → Console tab
2. Look for red errors
3. Usually: Wrong `VITE_API_URL` or backend not running

### "Failed to fetch" or CORS errors
**Fix:** 
1. Check backend `FRONTEND_URL` matches your Vercel URL
2. No trailing slashes
3. Must include `https://`
4. Redeploy backend after changing

### Backend is slow (30-60 second first load)
**Expected behavior:** Render free tier "sleeps" after 15 minutes of inactivity. First request wakes it up (slow), then it's fast again.

**Solution:** Upgrade to Render paid tier ($7/month) for always-on.

---

## 💡 Free Tier Limits

**What you get for free:**

| Service | Free Tier Limit |
|---------|-----------------|
| **Vercel** | 100 GB bandwidth/month, unlimited sites |
| **Render** | 750 hours/month (enough for 1 app 24/7), sleeps after 15 min |
| **Supabase** | 500 MB database, 2 GB bandwidth, 50K users |

**Monitoring usage:**
- Vercel: Dashboard → Analytics
- Render: Dashboard → Metrics
- Supabase: Dashboard → Settings → Billing

---

## 📞 Need Help?

**Check logs:**
1. **Backend logs:** Render dashboard → Logs tab
2. **Frontend logs:** Browser console (F12)
3. **Database logs:** Supabase dashboard → Logs

**Common issues?** See `DEPLOYMENT_GUIDE.md` → Troubleshooting section

**Still stuck?**
- Check platform status pages
- Review environment variables (most common issue)
- Test locally first: `npm run build` in both folders

---

## 🎊 Success Checklist

- [ ] Backend health endpoint returns `{"status":"ok"}`
- [ ] Frontend landing page loads with animations
- [ ] Sign up creates new account
- [ ] Dashboard loads with demo data
- [ ] Confusion button submits successfully
- [ ] No console errors (F12)
- [ ] Both URLs saved for future reference

**All checked?** You're done! Share your app! 🚀

---

## 📚 More Resources

- **Full deployment guide:** `DEPLOYMENT_GUIDE.md`
- **Initial setup:** `SETUP_GUIDE.md`
- **Features guide:** `FEATURE_GUIDE.md`
- **Educator guide:** `EDUCATOR_ANALYTICS_GUIDE.md`

---

**Last Updated:** 2026-08-22

**Deployment Time:** 10-15 minutes
**Difficulty:** Easy
**Cost:** Free
