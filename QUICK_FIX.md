# 🔧 Quick Fix: "Failed to fetch" Error

## Problem
The AI Tutor shows "Failed to fetch" error because the **backend server is not running**.

---

## ✅ Solution (3 Options)

### Option 1: Use the Startup Script (Easiest)
```bash
# Double-click this file in Windows Explorer:
start-dev.bat
```

This will open 3 terminal windows:
1. Backend API (Port 5000)
2. ML Service (Port 5001)  
3. Frontend (Port 5173)

**Wait 10 seconds** for all services to start, then refresh your browser.

---

### Option 2: Manual Start (Recommended for Development)

Open **3 separate terminals**:

**Terminal 1 - Backend API:**
```bash
cd backend
npm run dev
```
Wait for: `Server running on port 5000`

**Terminal 2 - ML Service:**
```bash
cd backend\ml
python app.py
```
Wait for: `Running on http://127.0.0.1:5001`

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```
Wait for: `Local: http://localhost:5173/`

---

### Option 3: Quick Check & Start

**Check if backend is running:**
```bash
curl http://localhost:5000/api/health
```

**If you get an error, start the backend:**
```bash
cd backend
npm run dev
```

---

## 🎯 Verify It's Working

1. **Backend API**: Visit http://localhost:5000/api/health
   - Should return: `{"status":"ok"}`

2. **ML Service**: Visit http://localhost:5001/health
   - Should return: `{"status":"healthy","service":"cogniva-ml-engine","version":"1.0"}`

3. **Frontend**: Visit http://localhost:5173
   - Should show the Cogniva login page

---

## 🐛 Still Not Working?

### Error: "npm command not found"
**Fix**: Install Node.js from https://nodejs.org

### Error: "python command not found"
**Fix**: Install Python from https://python.org

### Error: "Module not found"
**Fix**: Install dependencies
```bash
cd frontend && npm install
cd ../backend && npm install
cd ml && pip install -r requirements.txt
```

### Error: "Port 5000 already in use"
**Fix**: Kill the existing process
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Then restart
cd backend && npm run dev
```

### Error: "CORS policy"
**Fix**: Make sure `.env` files have correct URLs
```bash
# frontend/.env
VITE_API_URL=http://localhost:5000/api

# backend/.env
FRONTEND_URL=http://localhost:5173
```

---

## 📝 Common Issues

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
pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

### Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 🚀 Production Deployment

For production, see:
- **Full Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Quick Start**: [START_HERE.md](./START_HERE.md)

---

## ✅ Success Checklist

- [ ] Backend running on http://localhost:5000
- [ ] ML service running on http://localhost:5001
- [ ] Frontend running on http://localhost:5173
- [ ] Can log in to frontend
- [ ] Dashboard loads without errors
- [ ] AI Tutor no longer shows "Failed to fetch"

---

**Once all 3 services are running, the AI Tutor will work perfectly! 🎉**
