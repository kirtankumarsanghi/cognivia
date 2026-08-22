# 🧠 Cognivia Demo Access Guide

This guide provides multiple ways to access the Cognivia demo on Netlify without going through the standard signup process.

## 🚀 Quick Access Methods

### Method 1: Direct Demo Route (Recommended)
Simply visit: **`https://your-app.netlify.app/demo`**

This will:
- Show a beautiful role selection screen
- Let you choose Student or Educator view
- Automatically log you in with demo credentials
- Redirect you to the appropriate dashboard

### Method 2: URL Parameters
Use the quick-login route with role parameter:

**Student Demo:**
```
https://your-app.netlify.app/quick-login?role=student
```

**Educator Demo:**
```
https://your-app.netlify.app/quick-login?role=educator
```

### Method 3: Landing Page Demo Button
- Go to the homepage: `https://your-app.netlify.app`
- Click the **"🧠 DEMO"** button in the navigation bar
- Choose your role (Student or Educator)

## 🔑 Demo Account Credentials

If you need to login manually:

### Student Account
- **Email:** `student_demo@cognivia.com`
- **Password:** `password123!`
- **Dashboard:** `/dashboard`

### Educator Account
- **Email:** `educator_demo@cognivia.com`
- **Password:** `password123!`
- **Dashboard:** `/educator`

## 📋 What You Can Access

### As a Student
- **Dashboard:** Overview of your learning progress
- **Courses:** Browse and view course content
- **AI Tutor:** Interactive learning assistant
- **Revision:** Personalized study sessions
- **Knowledge Graph:** Visual concept maps
- **Study Groups:** Collaborate with peers
- **Achievements:** Track your milestones

### As an Educator
- **Dashboard:** Overview of student progress
- **Class Roster:** Manage students
- **Curriculum Builder:** Design course content
- **Analytics:** Track class performance

## 🔧 Technical Details

### How It Works
1. The `/demo` route uses the `DemoBypass` component
2. It authenticates with pre-configured demo accounts
3. Session is stored in localStorage as `cogniva-session`
4. Protected routes verify the session and role
5. Auto-redirects to appropriate dashboard

### Session Management
- Sessions are stored in `localStorage` with key `cogniva-session`
- Sessions include access token and expiry timestamp
- Auto-logout when session expires
- Refresh handled by auth service

### Components
- **`DemoBypass.tsx`** - Role selection and auto-login
- **`QuickLogin.tsx`** - URL parameter-based login
- **`useAuth.tsx`** - Authentication hook and session management
- **`ProtectedRoute.tsx`** - Route guards with role verification

## 🌐 Deployment Setup

### Netlify Configuration
The app is configured for Netlify with:
- Build command: `npm run build`
- Publish directory: `dist`
- Redirects: `/* /index.html 200` (for SPA routing)

### Environment Variables
Required in Netlify:
```
VITE_SUPABASE_URL=https://cbqswhmpdbojubljyinv.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=your_backend_url
```

## 🐛 Troubleshooting

### Demo Not Working
1. **Clear browser cache and localStorage**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. **Check browser console for errors**
   - Look for authentication errors
   - Verify network requests to Supabase

3. **Verify demo accounts exist in database**
   - student_demo@cognivia.com
   - educator_demo@cognivia.com

### Session Issues
- Sessions expire after the time specified in Supabase
- Clear `cogniva-session` from localStorage to reset
- Re-visit `/demo` to get a fresh session

### Wrong Dashboard
- If redirected to wrong dashboard, check your role in the profile
- The system redirects based on user role in the database

## 📱 Mobile Access
All demo methods work on mobile browsers:
- Navigate to `/demo` on mobile
- Tap the role you want to explore
- Automatic login and redirect

## 🔒 Security Note
Demo accounts have:
- Read-only or limited write access
- Sample data only (not production data)
- No sensitive information
- Separate from real user data

## 📞 Support
If demo access isn't working:
1. Check this guide for troubleshooting
2. Verify Netlify deployment is live
3. Confirm environment variables are set
4. Check Supabase connection status

---

**Last Updated:** 2026-08-22
**Version:** 1.0.0
