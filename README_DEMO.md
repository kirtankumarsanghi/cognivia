# 🧠 Cognivia Demo System

## Overview

The Cognivia demo system provides instant, no-signup access to both Student and Educator experiences. This system is designed for demonstrations, testing, and stakeholder previews.

## Quick Access

### 🚀 Main Demo URL
```
https://your-app.netlify.app/demo
```

Visit this URL to:
1. See a beautiful role selection screen
2. Click Student or Educator
3. Automatically log in
4. Start exploring immediately

## Features

### ✨ What Makes It Great

- **Zero Friction** - No signup, no forms, no hassle
- **One-Click Access** - Choose role and go
- **Beautiful UI** - Branded, professional interface
- **Mobile Friendly** - Works perfectly on all devices
- **Fast** - Instant authentication and redirect
- **Persistent** - Session stays active across refreshes
- **Safe** - Demo accounts only, no real user data

### 🎯 Available Views

#### Student Experience
Access via: `/demo` → Student View

**What You Can Explore:**
- Dashboard with learning metrics and progress
- Course catalog and course viewer
- AI-powered tutor for personalized help
- Revision system with spaced repetition
- Knowledge graphs showing concept relationships
- Study groups for collaboration
- Achievement badges and progress tracking

#### Educator Experience  
Access via: `/demo` → Educator View

**What You Can Explore:**
- Educator dashboard with class overview
- Student roster and management
- Curriculum builder for course design
- Analytics and progress tracking
- Class-wide performance metrics

## Access Methods

### Method 1: Direct Link (Recommended)
```
https://your-app.netlify.app/demo
```
Best for: Sharing with stakeholders, quick testing

### Method 2: Homepage Button
1. Visit `https://your-app.netlify.app`
2. Click "🧠 DEMO" in navigation bar
3. Choose your role

Best for: First-time visitors exploring from homepage

### Method 3: Quick Login URLs
```
Student:  https://your-app.netlify.app/quick-login?role=student
Educator: https://your-app.netlify.app/quick-login?role=educator
```
Best for: Direct links, bookmarks, automation

### Method 4: Manual Login
Use standard login page with:
- **Student:** `student_demo@cognivia.com` / `password123!`
- **Educator:** `educator_demo@cognivia.com` / `password123!`

Best for: Testing the login flow itself

## Technical Architecture

### Components

```
DemoBypass Component (src/components/DemoBypass.tsx)
├─ Role selection UI
├─ Auto-login logic
├─ Error handling
└─ Redirect logic

QuickLogin Component (src/components/QuickLogin.tsx)
├─ URL parameter parsing
├─ Direct login
└─ Status feedback

useAuth Hook (src/hooks/useAuth.tsx)
├─ Authentication state
├─ Login/logout functions
├─ Session management
└─ Profile loading

ProtectedRoute Component (src/components/ProtectedRoute.tsx)
├─ Session verification
├─ Role checking
├─ Redirect logic
└─ Loading states
```

### Authentication Flow

```
User visits /demo
      ↓
DemoBypass loads
      ↓
User selects role
      ↓
useAuth.login() called with demo credentials
      ↓
authService.signIn() authenticates with Supabase
      ↓
Session stored in localStorage as 'cogniva-session'
      ↓
User profile fetched from database
      ↓
User state updated in AuthContext
      ↓
Navigate to dashboard based on role
      ↓
ProtectedRoute verifies session
      ↓
Dashboard loads with user data
```

### Session Management

Sessions are stored in `localStorage`:
```javascript
{
  access_token: "...",
  refresh_token: "...",
  expires_at: 1234567890,
  user: {
    id: "...",
    email: "...",
    user_metadata: {...}
  }
}
```

**Key:** `cogniva-session`  
**Expiry:** Managed by Supabase (typically 1 hour)  
**Refresh:** Automatic when expired

## Demo Accounts

### Pre-configured Accounts

Two demo accounts exist in the database:

#### Student Account
- **Email:** `student_demo@cognivia.com`
- **Password:** `password123!`
- **Role:** `student`
- **Profile:** Complete with sample data
- **Courses:** Enrolled in demo courses
- **Progress:** Sample learning data

#### Educator Account
- **Email:** `educator_demo@cognivia.com`
- **Password:** `password123!`
- **Role:** `educator`
- **Profile:** Complete with sample data
- **Classes:** Sample roster data
- **Analytics:** Sample performance data

### Account Characteristics

- ✅ Pre-verified (no email confirmation needed)
- ✅ Full profiles (all fields populated)
- ✅ Sample data (realistic but fake)
- ✅ Safe permissions (read-only or limited write)
- ✅ Isolated (separate from real users)

## Deployment

### Prerequisites

1. **Frontend built:** `npm run build` in `frontend/`
2. **Netlify configured:** Environment variables set
3. **Supabase ready:** Demo accounts exist
4. **DNS setup:** Domain pointing to Netlify

### Deploy Steps

```bash
# Build
cd frontend
npm install
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Verify
curl https://your-app.netlify.app/demo
```

### Environment Variables (Netlify)

Required in Netlify Dashboard:
```
VITE_SUPABASE_URL=https://cbqswhmpdbojubljyinv.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=your_backend_url
```

### Build Configuration

`netlify.toml`:
```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Troubleshooting

### Issue: Demo page not loading

**Symptoms:** 404 error at `/demo`

**Solutions:**
1. Check `netlify.toml` has the redirect rule
2. Clear browser cache (`Ctrl+Shift+R`)
3. Verify deployment completed successfully
4. Check Netlify build logs for errors

### Issue: Login fails

**Symptoms:** "Login failed" error message

**Solutions:**
1. Open browser console (F12)
2. Check for network errors
3. Verify environment variables in Netlify
4. Ensure Supabase is accessible
5. Check demo accounts exist in database

### Issue: Wrong dashboard

**Symptoms:** Student sees educator view or vice versa

**Solutions:**
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Revisit `/demo` and choose correct role
4. Check user role in database profile

### Issue: Session expired

**Symptoms:** Logged out after some time

**Solutions:**
1. This is expected behavior (sessions expire)
2. Revisit `/demo` to get new session
3. Adjust session duration in Supabase if needed

## Monitoring

### Analytics

Track demo usage via:
- **Netlify Analytics:** Page views, geographic distribution
- **Supabase Dashboard:** Auth attempts, active sessions
- **Application Logs:** Login events, errors

### Key Metrics

Monitor:
- `/demo` page views
- Login success rate
- Time to dashboard
- Error frequency
- Browser/device distribution

## Security

### Safety Measures

- ✅ **Separate accounts:** Demo accounts isolated from real users
- ✅ **Limited permissions:** Demo accounts have restricted access
- ✅ **No real data:** All demo data is sample/fake
- ✅ **Session expiry:** Auto-logout after inactivity
- ✅ **No sensitive info:** Credentials are demo-only

### Best Practices

- Don't use demo accounts for real work
- Regularly audit demo account activity
- Reset demo data periodically
- Monitor for unusual activity
- Keep credentials simple but documented

## Documentation

### Available Guides

- **`DEMO_ACCESS.md`** - Complete technical guide
- **`DEMO_DEPLOYMENT_INSTRUCTIONS.md`** - Step-by-step deployment
- **`QUICK_DEMO_GUIDE.md`** - Quick reference for users
- **`DEMO_SOLUTION_SUMMARY.md`** - Implementation overview
- **`DEMO_DEPLOYMENT_CHECKLIST.md`** - Deployment verification
- **`README_DEMO.md`** - This file (system overview)

### Quick Links

- [Access Guide](./DEMO_ACCESS.md) - How to use the demo
- [Deployment Guide](./DEMO_DEPLOYMENT_INSTRUCTIONS.md) - How to deploy
- [Quick Guide](./QUICK_DEMO_GUIDE.md) - Fast reference
- [Checklist](./DEMO_DEPLOYMENT_CHECKLIST.md) - Verify deployment

## Support

### Getting Help

1. **Read the guides:** Check documentation files
2. **Check console:** Browser DevTools (F12)
3. **Review logs:** Netlify deployment logs
4. **Test locally:** Run `npm run dev` locally
5. **Ask team:** Contact development team

### Common Questions

**Q: Do demo accounts expire?**  
A: No, but sessions do (typically 1 hour)

**Q: Can I create my own demo account?**  
A: Yes, add to Supabase with role and profile

**Q: Does demo data persist?**  
A: Sample data is in database, can be reset

**Q: Can I customize the demo page?**  
A: Yes, edit `DemoBypass.tsx` component

**Q: Does demo work offline?**  
A: No, requires internet for authentication

## Roadmap

### Future Enhancements

- [ ] Demo data reset button
- [ ] Custom demo scenarios
- [ ] Guided tour integration
- [ ] Demo usage analytics dashboard
- [ ] Multiple demo accounts per role
- [ ] Time-limited demo sessions
- [ ] Demo feedback collection

## Contributing

To improve the demo system:

1. Fork the repository
2. Make changes in a feature branch
3. Test thoroughly (use checklist)
4. Submit pull request with description
5. Await code review

## License

Same as main Cognivia project.

---

## Summary

The Cognivia demo system provides instant, hassle-free access to the platform for demonstrations and testing. With one-click login, beautiful UI, and comprehensive documentation, it's the perfect way to showcase the platform.

**Ready to try it?** Visit: `https://your-app.netlify.app/demo`

---

*Version: 1.0.0*  
*Last Updated: 2026-08-22*  
*Maintainer: Development Team*
