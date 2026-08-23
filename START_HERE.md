# 🚀 Cogniva - Quick Start Guide

## Welcome! Your App is Ready to Go Live 🎉

This guide will get you up and running in **under 5 minutes**.

---

## 📱 What's Been Fixed

### ✅ Mobile UI Improvements
- **Custom cursor disabled** on mobile/touch devices
- **Bottom sheet modals** for mobile-friendly interactions
- **Responsive layouts** that adapt from phone to desktop
- **Touch-optimized** buttons and forms (44px minimum tap targets)
- **Safe area support** for notched devices (iPhone X+)
- **Performance optimizations** for smooth mobile experience

### ✅ Real, Live Data Connections
- **Supabase Database**: Connected and ready ✅
- **Gemini AI**: Connected and ready ✅
- **ML Service**: Ready to deploy ⚠️ (currently local)
- **Authentication**: JWT-based, production-ready ✅

---

## 🏃 Quick Start (Development)

### 1. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm install

# Or install separately
cd frontend && npm install
cd ../backend && npm install
```

### 2. Start Development Servers

#### Option A: All at Once (Recommended)
```bash
# From root directory
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- ML Service: http://localhost:5001

#### Option B: Manually
```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: ML Service
cd backend/ml
python app.py
```

### 3. Open in Browser

**Desktop**: http://localhost:5173
**Mobile**: Find your local IP and visit `http://YOUR_IP:5173`

---

## 📱 Testing on Mobile

### Find Your Local IP

**Windows**:
```bash
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)
```

**Mac/Linux**:
```bash
ifconfig
# Look for "inet" under your network adapter
```

### Access on Mobile
1. Make sure your phone is on the **same WiFi network**
2. Visit: `http://YOUR_IP:5173` (e.g., `http://192.168.1.100:5173`)
3. Test all mobile features:
   - [ ] Navigation drawer opens/closes
   - [ ] Bottom tabs work
   - [ ] Confusion button opens modal
   - [ ] Forms are usable without zooming
   - [ ] No custom cursor appears
   - [ ] Touch targets are easy to tap

---

## 🔐 Demo Accounts

### Student Account
- **Email**: `student@cognivia.dev`
- **Password**: `demo123`

### Educator Account
- **Email**: `educator@cognivia.dev`
- **Password**: `demo123`

---

## 🌐 Deploy to Production

### Quick Deploy (Recommended)

#### 1. Deploy ML Service (Railway)
```bash
cd backend/ml
railway login
railway init
railway up
# Save the URL: https://your-ml-service.railway.app
```

#### 2. Deploy Backend (Railway)
```bash
cd backend
railway login
railway init
# Add environment variables in Railway dashboard
railway up
# Save the URL: https://your-backend.railway.app
```

#### 3. Deploy Frontend (Vercel)
```bash
cd frontend
# Update .env with production URLs
vercel --prod
```

**Full deployment guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 📁 Project Structure

```
cognivia/
├── frontend/              # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # React hooks
│   │   ├── services/      # API services
│   │   └── styles/        # CSS (including mobile.css)
│   └── package.json
│
├── backend/               # Node.js + Express
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Auth, error handling
│   │   └── services/      # External services
│   ├── ml/                # Python Flask ML service
│   │   ├── inference/     # ML models
│   │   ├── training/      # Model training scripts
│   │   └── app.py         # Flask server
│   └── package.json
│
├── DEPLOYMENT_GUIDE.md    # Full deployment instructions
├── MOBILE_SETUP.md        # Mobile UI improvements
└── START_HERE.md          # This file!
```

---

## 🎨 Key Features

### For Students
- 📊 **Real-time learning dashboard**
- 🤔 **Confusion button** - Private, instant help
- 🤖 **AI Tutor** - Powered by Gemini 1.5 Flash
- 📈 **Mastery tracking** - Bayesian Knowledge Tracing
- 🎯 **Personalized revision plans**
- 🏆 **Achievements & streaks**

### For Educators
- 📉 **Class-wide confusion analytics**
- 👥 **Student roster & progress tracking**
- 🎯 **Intervention recommendations**
- 📚 **Curriculum builder**
- 🧠 **ML-powered insights**

---

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://cbqswhmpdbojubljyinv.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_AqQ0AZb6gH2AmWyLlN3_Zw_TFSQ1Qzf
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```env
PORT=5000
SUPABASE_URL=https://cbqswhmpdbojubljyinv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
FRONTEND_URL=http://localhost:5173
ML_SERVICE_URL=http://127.0.0.1:5001
```

**✅ These are already configured in your `.env` files!**

---

## 🐛 Troubleshooting

### Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### ML Service won't start
```bash
cd backend/ml
pip install -r requirements.txt
python app.py
```

### Database connection issues
- Verify Supabase URL and keys in `.env`
- Check Supabase dashboard for service status

### AI not responding
- Verify Gemini API key in backend `.env`
- Check API quota at https://aistudio.google.com

---

## 📚 Documentation

- **Mobile Setup**: [MOBILE_SETUP.md](./MOBILE_SETUP.md)
- **Deployment**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Backend API**: [backend/README.md](./backend/README.md)
- **Supabase Schema**: Check Supabase dashboard

---

## 🎯 Next Steps

1. **Local Development**:
   - [ ] Start all services
   - [ ] Test on desktop browser
   - [ ] Test on mobile device

2. **Customize**:
   - [ ] Update branding colors in `tailwind.config.js`
   - [ ] Add your own courses and content
   - [ ] Customize AI tutor prompts

3. **Deploy**:
   - [ ] Deploy ML service
   - [ ] Deploy backend
   - [ ] Deploy frontend
   - [ ] Test production environment

4. **Monitor**:
   - [ ] Set up error tracking (Sentry)
   - [ ] Configure analytics
   - [ ] Monitor performance

---

## 💡 Tips

- **Use Chrome DevTools** device mode to test mobile UI on desktop
- **React DevTools** browser extension is helpful for debugging
- **Mobile debugging**: Use `chrome://inspect` for Android or Safari Web Inspector for iOS
- **Hot Module Replacement** (HMR) is enabled - changes appear instantly

---

## 🎉 You're All Set!

Your app is now:
- ✅ **Mobile-friendly** on all devices
- ✅ **Connected to real services** (Supabase + Gemini AI)
- ✅ **Production-ready** authentication
- ✅ **Performant** and optimized

**Need help?** Check the documentation files or review the inline code comments.

**Ready to deploy?** Follow the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 📞 Quick Commands

```bash
# Development
npm run dev                # Start all services
npm run dev:frontend       # Frontend only
npm run dev:backend        # Backend only

# Build
npm run build              # Build frontend
npm run build:frontend     # Frontend only

# Deployment
vercel --prod              # Deploy frontend
railway up                 # Deploy backend/ML
```

---

**Happy Building! 🚀**
