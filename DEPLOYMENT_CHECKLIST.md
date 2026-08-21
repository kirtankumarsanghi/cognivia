# ✅ Deployment Checklist

**Use this checklist to track your deployment progress step by step.**

Print this out or keep it open while deploying!

---

## 📋 Pre-Deployment

### Database Setup
- [ ] Supabase account created
- [ ] New Supabase project created
- [ ] Project name: ____________________
- [ ] Region selected: ____________________
- [ ] Database password saved securely
- [ ] `schema.sql` executed successfully (8 tables created)
- [ ] `seed.sql` executed (optional but recommended)
- [ ] Tables visible in Table Editor
- [ ] Supabase credentials saved:
  ```
  Project URL: ____________________________________
  Anon Key: ________________________________________
  Service Role Key: ________________________________
  ```

### Code Repository
- [ ] Code pushed to GitHub
- [ ] Repository is public or private (works either way)
- [ ] Repository URL: ____________________________________
- [ ] `.env` files NOT pushed (in `.gitignore`)
- [ ] `.env.example` files ARE pushed
- [ ] Latest changes committed and pushed

### Local Testing
- [ ] Backend builds successfully: `cd backend && npm run build`
- [ ] Frontend builds successfully: `cd frontend && npm run build`
- [ ] Backend runs locally: `npm start` → http://localhost:5000/api/health works
- [ ] Frontend runs locally: `npm run dev` → http://localhost:5173 loads
- [ ] Local environment variables configured correctly
- [ ] No console errors when running locally

---

## 🚀 Backend Deployment (Render)

### Account Setup
- [ ] Render account created at [render.com](https://render.com)
- [ ] Signed in with GitHub (recommended)
- [ ] Repository access authorized

### Service Configuration
- [ ] New Web Service created
- [ ] Repository connected
- [ ] Settings configured:
  ```
  Name: cognivia-backend
  Region: ____________________
  Branch: main
  Root Directory: backend
  Runtime: Node
  Build Command: npm install && npm run build
  Start Command: npm start
  Instance Type: Free
  ```

### Environment Variables
- [ ] `PORT` = `5000`
- [ ] `FRONTEND_URL` = `https://temp.vercel.app` (temporary, will update)
- [ ] `SUPABASE_URL` = (your Supabase project URL)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = (your service role key)
- [ ] `GEMINI_API_KEY` = (your key or leave blank)
- [ ] `NODE_ENV` = `production`

### Deployment
- [ ] Service created and building
- [ ] Build logs show no errors
- [ ] Service status shows "Live"
- [ ] Backend URL obtained: ____________________________________
- [ ] Health check works: `https://your-backend-url.com/api/health`
- [ ] Backend URL saved for later

---

## 🎨 Frontend Deployment (Vercel)

### Account Setup
- [ ] Vercel account created at [vercel.com](https://vercel.com)
- [ ] Signed in with GitHub
- [ ] Repository access authorized

### Project Configuration
- [ ] New Project created
- [ ] Repository imported
- [ ] Settings configured:
  ```
  Framework Preset: Vite
  Root Directory: frontend
  Build Command: npm run build
  Output Directory: dist
  ```

### Environment Variables
- [ ] `VITE_SUPABASE_URL` = (your Supabase project URL)
- [ ] `VITE_SUPABASE_ANON_KEY` = (your Supabase ANON key - NOT service role!)
- [ ] `VITE_API_URL` = `https://your-backend-url.com/api`

⚠️ Verify you used ANON key, not service role key!

### Deployment
- [ ] Project deployed
- [ ] Build logs show no errors
- [ ] Deployment status shows "Ready"
- [ ] Frontend URL obtained: ____________________________________
- [ ] Landing page loads at frontend URL
- [ ] No console errors (F12)
- [ ] Frontend URL saved

---

## 🔄 Backend CORS Update

### Update Environment Variable
- [ ] Returned to Render dashboard
- [ ] Selected backend service
- [ ] Opened Environment tab
- [ ] Updated `FRONTEND_URL` to actual Vercel URL
- [ ] Saved changes
- [ ] Waited for auto-redeploy (2-3 minutes)
- [ ] Service status shows "Live" again

---

## 🧪 Testing

### Basic Functionality
- [ ] Frontend landing page loads with animations
- [ ] "Get Started" button works
- [ ] Demo mode works (Student → loads dashboard)
- [ ] No console errors in browser (F12)

### Authentication
- [ ] "Sign Up" page loads
- [ ] Can create new account:
  ```
  Test Email: test@example.com
  Test Password: Test123!
  ```
- [ ] Redirects to dashboard after signup
- [ ] New user appears in Supabase → Authentication → Users

### API Integration
- [ ] Dashboard displays data
- [ ] "I'm Confused" button works
- [ ] Confusion signal submits successfully
- [ ] Success message appears
- [ ] Check Render logs → API request logged

### Database Connection
- [ ] Course data loads in dashboard
- [ ] Concepts display with mastery scores
- [ ] Progress tracker shows data
- [ ] Check Supabase → Logs → No errors

### AI Features (If GEMINI_API_KEY configured)
- [ ] AI Tutor opens
- [ ] Can send message
- [ ] Receives AI response (not demo response)
- [ ] Conversation history saves

---

## 📊 Monitoring Setup (Optional)

### UptimeRobot
- [ ] Account created at [uptimerobot.com](https://uptimerobot.com)
- [ ] Monitor created for backend: `https://your-backend-url.com/api/health`
- [ ] Monitor created for frontend: `https://your-frontend-url.com`
- [ ] Check interval: 5 minutes
- [ ] Alert email configured
- [ ] Test alert sent successfully

### Platform Analytics
- [ ] Vercel Analytics enabled (free)
- [ ] Render Metrics checked (in dashboard)
- [ ] Supabase usage reviewed (Settings → Billing)

---

## 📝 Documentation

### URLs Saved
- [ ] Frontend URL saved: ____________________________________
- [ ] Backend URL saved: ____________________________________
- [ ] Supabase URL saved: ____________________________________
- [ ] Dashboard links saved:
  ```
  Vercel: https://vercel.com/dashboard
  Render: https://dashboard.render.com
  Supabase: https://supabase.com/dashboard
  ```

### Credentials Secured
- [ ] All passwords saved in password manager
- [ ] API keys stored securely
- [ ] Environment variables documented
- [ ] Team members have access (if needed)

### Repository Updated
- [ ] README updated with deployment URLs
- [ ] Documentation reviewed
- [ ] Deployment date added to docs

---

## 🎯 Post-Deployment

### Share with Users
- [ ] Production URL shared with team
- [ ] User documentation prepared
- [ ] Support email configured
- [ ] Feedback collection set up

### Auto-Deployments
- [ ] Verified auto-deploy works:
  ```bash
  # Make a test change
  git add .
  git commit -m "test: verify auto-deploy"
  git push origin main
  # Wait 3-5 minutes
  # Check both Vercel and Render dashboards
  ```
- [ ] Both services auto-deployed successfully
- [ ] Changes visible on production URLs

### Performance Check
- [ ] Page load time < 3 seconds
- [ ] API responses < 500ms
- [ ] No JavaScript errors
- [ ] Animations smooth (60 FPS)
- [ ] Mobile responsive (test on phone)

---

## 🚨 Troubleshooting Checklist

If something doesn't work, verify:

### Backend Issues
- [ ] All environment variables set correctly in Render
- [ ] `SUPABASE_URL` has no trailing slash
- [ ] Using `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
- [ ] Build completed successfully (check logs)
- [ ] Service status is "Live" (not "Build Failed")
- [ ] Port 5000 is used (in environment variable)

### Frontend Issues
- [ ] All environment variables set correctly in Vercel
- [ ] Variables start with `VITE_` prefix
- [ ] Using `VITE_SUPABASE_ANON_KEY` (not service role!)
- [ ] `VITE_API_URL` points to correct backend URL
- [ ] `VITE_API_URL` ends with `/api` (not trailing slash after)
- [ ] Build completed successfully

### CORS Issues
- [ ] Backend `FRONTEND_URL` matches exact Vercel URL
- [ ] `FRONTEND_URL` includes `https://` protocol
- [ ] No trailing slash in `FRONTEND_URL`
- [ ] Backend redeployed after updating `FRONTEND_URL`

### Database Issues
- [ ] Supabase project is active (not paused)
- [ ] Schema executed successfully
- [ ] Tables exist in Table Editor
- [ ] RLS policies configured (from schema.sql)
- [ ] No connection errors in Supabase logs

---

## ✅ Success Criteria

**Deployment is successful when ALL of these are true:**

- [ ] ✅ Backend health endpoint returns `{"status":"ok"}`
- [ ] ✅ Frontend landing page loads without errors
- [ ] ✅ Can sign up and create new account
- [ ] ✅ Dashboard loads with data after signup
- [ ] ✅ Can submit confusion signal successfully
- [ ] ✅ No console errors in browser (F12)
- [ ] ✅ API requests succeed (check Network tab)
- [ ] ✅ Auto-deployments work (test with git push)
- [ ] ✅ All URLs documented and saved
- [ ] ✅ Team members have access

---

## 🎊 Completion

**Date Deployed:** ____________________

**Deployed By:** ____________________

**Production URLs:**
```
Frontend: ________________________________________
Backend: _________________________________________
```

**Time Taken:** ______ minutes

**Issues Encountered:** (if any)
```
_________________________________________________
_________________________________________________
_________________________________________________
```

**Notes for Future:**
```
_________________________________________________
_________________________________________________
_________________________________________________
```

---

## 📞 Quick Reference

### Platform Dashboards
- **Vercel:** https://vercel.com/dashboard
- **Render:** https://dashboard.render.com
- **Supabase:** https://supabase.com/dashboard

### Documentation
- **Quick Deploy:** QUICK_DEPLOY.md
- **Full Guide:** DEPLOYMENT_GUIDE.md
- **Setup Guide:** SETUP_GUIDE.md
- **Troubleshooting:** DEPLOYMENT_GUIDE.md → Troubleshooting

### Support
- **GitHub Issues:** Create an issue with details
- **Platform Status:** 
  - Vercel: https://www.vercelstatus.com
  - Render: https://status.render.com
  - Supabase: https://status.supabase.com

---

**Congratulations on your deployment! 🚀🎉**

**Next Steps:**
1. Share your app with users
2. Set up monitoring (UptimeRobot)
3. Collect feedback
4. Iterate and improve

**Need to deploy again?** Keep this checklist - it makes future deployments faster!

---

**Last Updated:** 2026-08-22
