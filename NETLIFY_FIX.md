# 🚀 Fix Netlify Deployment

## Problem
Your frontend is deployed to Netlify, but the backend isn't deployed yet, so the API calls are failing.

---

## ✅ Solution (2 Steps)

### Step 1: Deploy Backend to Railway (Free & Fast)

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login to Railway:**
```bash
railway login
```

3. **Deploy Backend:**
```bash
cd backend
railway init
railway up
```

4. **Copy the Backend URL** (it will look like: `https://your-backend.up.railway.app`)

---

### Step 2: Update Netlify Environment Variables

1. **Go to Netlify Dashboard**: https://app.netlify.com
2. **Select your site**
3. **Go to**: Site settings → Environment variables
4. **Add this variable:**
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend.up.railway.app/api` (use your Railway URL)

5. **Trigger a new deploy**:
   - Go to: Deploys → Trigger deploy → Deploy site

---

## 🎯 Alternative: Quick Backend Deployment (Render)

If you prefer Render.com:

1. **Go to**: https://render.com
2. **Click**: New → Web Service
3. **Connect your GitHub repo**
4. **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node 18

5. **Add Environment Variables**:
```
PORT=5000
SUPABASE_URL=https://cbqswhmpdbojubljyinv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=https://your-netlify-site.netlify.app
ML_SERVICE_URL=http://localhost:5001
```

6. **Deploy** and copy the URL

7. **Update Netlify environment variable** with your Render backend URL

---

## 🔧 Temporary Fix (Test Locally)

If you just want to test locally for now:

1. **Start your backend locally:**
```bash
cd backend
npm run dev
```

2. **Keep it running** and visit your Netlify site

⚠️ **Note**: This won't work for other users, only for you while your laptop is on.

---

## 📝 Environment Variables Checklist

### Netlify (Frontend)
- [x] `VITE_SUPABASE_URL` = `https://cbqswhmpdbojubljyinv.supabase.co`
- [x] `VITE_SUPABASE_ANON_KEY` = `sb_publishable_AqQ0AZb6gH2AmWyLlN3_Zw_TFSQ1Qzf`
- [ ] `VITE_API_URL` = `https://your-backend-url.com/api` ← **UPDATE THIS**

### Railway/Render (Backend)
- [ ] `PORT` = `5000`
- [ ] `SUPABASE_URL` = `https://cbqswhmpdbojubljyinv.supabase.co`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `your_supabase_service_role_key_here`
- [ ] `GEMINI_API_KEY` = `your_gemini_api_key_here`
- [ ] `FRONTEND_URL` = `https://your-netlify-site.netlify.app`
- [ ] `ML_SERVICE_URL` = (optional for now)

---

## 🎉 Expected Result

Once you complete these steps:
1. ✅ Frontend works on Netlify
2. ✅ Backend works on Railway/Render
3. ✅ AI Tutor works
4. ✅ Login/signup works
5. ✅ Dashboard loads with real data

---

## 🚨 Common Issues

### "CORS Error"
**Fix**: Make sure backend's `FRONTEND_URL` matches your Netlify URL exactly

### "401 Unauthorized"
**Fix**: Check that Supabase keys are correct in backend environment variables

### "Still showing localhost"
**Fix**: 
1. Update Netlify environment variable
2. Trigger new deploy (don't just restart)
3. Clear browser cache (Ctrl+Shift+R)

---

## 📞 Need Help?

If you get stuck, run this locally to test:
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Then visit `http://localhost:5173` to verify everything works locally first.

---

**Once backend is deployed and Netlify environment variable is updated, your app will work perfectly! 🎉**
