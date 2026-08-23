# 🏗️ Cogniva Architecture

## Current Status

```
┌──────────────────────────────────────────────────────┐
│                  User's Browser                      │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│          Frontend (React + Vite)                     │
│          ✅ DEPLOYED TO NETLIFY                      │
│          https://your-site.netlify.app               │
│                                                      │
│  Currently trying to connect to:                     │
│  ❌ http://localhost:5000/api (DOESN'T WORK!)       │
└────────────────────┬─────────────────────────────────┘
                     │
                     │ ❌ BROKEN CONNECTION
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│          Backend (Node.js + Express)                 │
│          ❌ NOT DEPLOYED                             │
│          Only runs on your computer                  │
│                                                      │
│  Connected to:                                       │
│  - ✅ Supabase Database                              │
│  - ✅ Gemini AI                                      │
│  - ⚠️  ML Service (optional)                         │
└──────────────────────────────────────────────────────┘
```

---

## What You Need

```
┌──────────────────────────────────────────────────────┐
│                  User's Browser                      │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│          Frontend (React + Vite)                     │
│          ✅ DEPLOYED TO NETLIFY                      │
│          https://your-site.netlify.app               │
│                                                      │
│  Environment Variable:                               │
│  VITE_API_URL = https://your-backend.railway.app/api│
└────────────────────┬─────────────────────────────────┘
                     │
                     │ ✅ SECURE HTTPS CONNECTION
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│          Backend (Node.js + Express)                 │
│          ✅ DEPLOY TO RAILWAY/RENDER                 │
│          https://your-backend.railway.app            │
│                                                      │
│  Environment Variables:                              │
│  - SUPABASE_URL                                      │
│  - SUPABASE_SERVICE_ROLE_KEY                         │
│  - GEMINI_API_KEY                                    │
│  - FRONTEND_URL                                      │
│                                                      │
│  Connected to:                                       │
│  - ✅ Supabase Database                              │
│  - ✅ Gemini AI                                      │
│  - ⚠️  ML Service (optional)                         │
└──────────────────────────────────────────────────────┘
```

---

## Services & Ports

### Development (localhost)
```
Frontend:  http://localhost:5173
Backend:   http://localhost:5000
ML:        http://localhost:5001
```

### Production (deployed)
```
Frontend:  https://your-site.netlify.app
Backend:   https://your-backend.railway.app
ML:        https://your-ml.railway.app (optional)
```

---

## Data Flow

```
User Action
    │
    ▼
Frontend (React)
    │
    │ HTTP Request with JWT Token
    │
    ▼
Backend API (Express)
    │
    ├─► Supabase (Database)
    │   └─► Read/Write Data
    │
    ├─► Gemini AI (Google)
    │   └─► AI Tutor Responses
    │
    └─► ML Service (Python)
        └─► Mastery Predictions
```

---

## Authentication Flow

```
1. User signs up/logs in
   │
   ▼
2. Frontend → Supabase Auth
   │
   ▼
3. Supabase returns JWT Token
   │
   ▼
4. Frontend stores token in localStorage
   │
   ▼
5. Every API request includes:
   Authorization: Bearer <token>
   │
   ▼
6. Backend validates token with Supabase
   │
   ▼
7. Backend returns data
```

---

## Deployment Checklist

### Frontend (Netlify)
- [x] Code deployed to Netlify
- [ ] Environment variable: `VITE_API_URL` ← **MISSING**
- [x] Build command: `npm run build`
- [x] Publish directory: `dist`

### Backend (Railway/Render)
- [ ] Code deployed ← **NOT DONE YET**
- [ ] Environment variables set
- [ ] URL copied to Netlify

### Database (Supabase)
- [x] Database created
- [x] Tables created
- [x] RLS policies enabled
- [x] Demo data seeded

### AI Services
- [x] Gemini API key configured
- [ ] ML service deployed (optional)

---

## What's Working vs Not Working

### ✅ Working
- Netlify hosting (frontend)
- Supabase database
- Gemini AI API key
- Local development (when you run `npm run dev`)

### ❌ Not Working (Yet)
- Backend API in production
- API calls from Netlify site
- Login on deployed site
- AI Tutor on deployed site

---

## Quick Deploy Commands

### Deploy Backend to Railway
```bash
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```

### Update Netlify Environment
1. Copy Railway URL (e.g., `https://xxx.up.railway.app`)
2. Go to Netlify Dashboard
3. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://xxx.up.railway.app/api`
4. Trigger new deploy

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Netlify (Frontend) | Free | $0/month |
| Railway (Backend) | Free Tier | $0/month (500 hrs) |
| Supabase (Database) | Free | $0/month (up to 500MB) |
| Gemini AI | Free Tier | $0/month (60 req/min) |
| **Total** | | **$0/month** |

⚠️ **Note**: Free tiers have limits. For production with many users, you may need paid plans.

---

## Next Steps

1. **Deploy Backend**: Run `railway-deploy.bat`
2. **Update Netlify**: Add `VITE_API_URL` environment variable
3. **Test**: Visit your Netlify site and try logging in
4. **Celebrate**: Your app is live! 🎉

---

**See NETLIFY_FIX.md for detailed step-by-step instructions!**
