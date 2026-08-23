# Cogniva Deployment Guide - Making It Live

## 🎯 Overview
This guide will help you deploy Cogniva to production with real, live data and services.

## 📋 Prerequisites Checklist

### Required Services
- ✅ **Supabase Account** (already configured)
- ✅ **Google Gemini AI API Key** (already configured)
- ⚠️ **Python ML Service Hosting** (needs deployment)
- ⚠️ **Frontend Hosting** (Vercel/Netlify/Cloudflare)
- ⚠️ **Backend Hosting** (Railway/Render/fly.io)

### Current Status
- **Database**: ✅ Live (Supabase)
- **AI Service**: ✅ Live (Gemini API)
- **ML Service**: ⚠️ Local only (needs deployment)
- **Backend API**: ⚠️ Local only (needs deployment)
- **Frontend**: ⚠️ Local only (needs deployment)

---

## 🚀 Step-by-Step Deployment

### 1. Deploy Python ML Service

#### Option A: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Navigate to ML service
cd backend/ml

# Initialize Railway
railway login
railway init

# Add environment variables in Railway dashboard
# No environment variables needed for ML service

# Deploy
railway up
```

#### Option B: Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Set:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Environment**: Python 3.11
5. Deploy

#### Option C: fly.io
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Navigate to ML service
cd backend/ml

# Launch app
fly launch

# Deploy
fly deploy
```

**After deployment, note your ML service URL (e.g., `https://your-ml-service.railway.app`)**

---

### 2. Deploy Node.js Backend

#### Option A: Railway (Recommended)
```bash
# Navigate to backend
cd backend

# Initialize Railway
railway login
railway init

# Add environment variables in Railway dashboard:
PORT=5000
SUPABASE_URL=https://cbqswhmpdbojubljyinv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
FRONTEND_URL=https://your-frontend-url.vercel.app
ML_SERVICE_URL=https://your-ml-service.railway.app

# Deploy
railway up
```

#### Option B: Render
1. Create new Web Service
2. Connect GitHub repo
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node 18
4. Add all environment variables from above
5. Deploy

**After deployment, note your backend URL (e.g., `https://your-backend.railway.app`)**

---

### 3. Deploy Frontend

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Update .env with production URLs
VITE_SUPABASE_URL=https://cbqswhmpdbojubljyinv.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_AqQ0AZb6gH2AmWyLlN3_Zw_TFSQ1Qzf
VITE_API_URL=https://your-backend.railway.app/api

# Deploy
vercel --prod
```

#### Option B: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to frontend
cd frontend

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

#### Option C: Cloudflare Pages
1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect GitHub repo
3. Set:
   - **Build Command**: `npm run build`
   - **Build Output**: `dist`
   - **Root Directory**: `frontend`
4. Add environment variables
5. Deploy

---

### 4. Update Environment Variables

#### Frontend (.env)
```env
VITE_SUPABASE_URL=https://cbqswhmpdbojubljyinv.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_AqQ0AZb6gH2AmWyLlN3_Zw_TFSQ1Qzf
VITE_API_URL=https://your-backend.railway.app/api
```

#### Backend (.env)
```env
PORT=5000
SUPABASE_URL=https://cbqswhmpdbojubljyinv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
FRONTEND_URL=https://your-frontend.vercel.app
ML_SERVICE_URL=https://your-ml-service.railway.app
```

#### ML Service (No env needed)
The ML service has no external dependencies and requires no environment variables.

---

### 5. Configure CORS

#### Backend (backend/src/index.ts or server.ts)
Make sure CORS is configured to allow your frontend domain:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend.vercel.app'
  ],
  credentials: true
}));
```

---

### 6. Database Setup (Already Done ✅)

Your Supabase database is already configured with:
- ✅ Tables created
- ✅ Row Level Security (RLS) policies
- ✅ Demo data seeded

**No additional database setup needed!**

---

### 7. Test Production Deployment

#### Smoke Tests
1. **Frontend loads**: Visit your Vercel URL
2. **Login works**: Try demo accounts or create new account
3. **Dashboard loads**: Check student/educator dashboards
4. **Confusion button**: Submit a confusion signal
5. **AI Tutor**: Ask a question
6. **ML Insights**: Check ML predictions work
7. **Mobile**: Test on real mobile device

#### Demo Accounts (for testing)
- **Student**: `student@cognivia.dev` / `demo123`
- **Educator**: `educator@cognivia.dev` / `demo123`

---

### 8. Remove Mock Data

#### Frontend (useApi.ts)
The frontend already tries real backend first and falls back to mock data. Once backend is deployed, it will automatically use real data.

**No code changes needed!**

#### Backend
Remove demo bypass functions if desired:
- `authService.demoLocalBypass()` in `frontend/src/services/authService.ts` (lines 453-488)

---

## 🔒 Security Hardening

### 1. Environment Variables
- ✅ Already using .env files
- ⚠️ Never commit .env to Git
- ✅ Use platform environment variable managers (Railway/Vercel dashboard)

### 2. Authentication
The current auth middleware is already production-ready:
- ✅ JWT validation
- ✅ Bearer token extraction
- ✅ Role-based access control
- ✅ Error handling

### 3. API Rate Limiting
Add to backend:
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. HTTPS
- ✅ Automatic with Vercel/Railway/Render
- All traffic encrypted by default

---

## 📊 Monitoring Setup

### Recommended Tools
1. **Sentry** (Error tracking)
   - Frontend errors
   - Backend crashes
   - Performance monitoring

2. **LogRocket** (Session replay)
   - See what users see
   - Debug mobile issues

3. **Vercel Analytics** (Free with Vercel)
   - Page views
   - Performance metrics

4. **Supabase Dashboard** (Built-in)
   - Database performance
   - API usage
   - Auth metrics

---

## 🎉 Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend API deployed and responding
- [ ] ML service deployed and accessible
- [ ] All environment variables set correctly
- [ ] CORS configured properly
- [ ] Login/signup works
- [ ] Dashboard loads with real data
- [ ] Confusion signals save to database
- [ ] AI Tutor generates responses
- [ ] ML predictions work
- [ ] Mobile UI is responsive
- [ ] Custom cursor disabled on mobile
- [ ] Forms don't trigger iOS zoom
- [ ] Safe areas respected on notched devices
- [ ] Performance is acceptable (< 3s load time)
- [ ] Error tracking set up
- [ ] Monitoring dashboards configured

---

## 🐛 Common Deployment Issues

### Issue: CORS errors
**Solution**: Make sure backend CORS allows your frontend domain

### Issue: ML service not responding
**Solution**: Check ML_SERVICE_URL environment variable in backend

### Issue: 401 Unauthorized errors
**Solution**: Verify Supabase keys are correct in environment variables

### Issue: Gemini AI not working
**Solution**: Check GEMINI_API_KEY and verify quota not exceeded

### Issue: Mobile UI broken
**Solution**: Run `npm run build` to ensure mobile.css is included

### Issue: Database connection failed
**Solution**: Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

---

## 📞 Support

If you encounter issues:
1. Check deployment logs in Railway/Vercel dashboard
2. Check Supabase logs for database errors
3. Use browser DevTools Network tab to debug API calls
4. Check environment variables are set correctly

---

## 🎓 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Gemini AI Docs](https://ai.google.dev/docs)

---

**Your app is now LIVE! 🚀**
