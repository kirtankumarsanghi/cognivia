# 🔐 Managing Secrets Safely

## ⚠️ IMPORTANT: Secrets NOT in Git

Your actual API keys and secrets are stored in:
- **`.env.secrets`** (root directory) - NOT committed to Git
- **`backend/.env`** (backend directory) - NOT committed to Git  
- **`frontend/.env`** (frontend directory) - NOT committed to Git

These files are protected by `.gitignore` and will never be pushed to GitHub.

---

## 📋 Where to Find Your Secrets

### Local Development
Check these files on your computer:
- `backend/.env`
- `frontend/.env`
- `.env.secrets` (backup reference)

### Deployment Platforms
Your secrets are configured in:
- **Render**: Dashboard → Environment Variables
- **Netlify**: Dashboard → Site settings → Environment Variables
- **Railway**: Dashboard → Variables tab

---

## 🔄 How to Use Secrets in Deployment

### For Render (Backend)
1. Go to https://dashboard.render.com
2. Click your service
3. Environment → Add Environment Variable
4. Copy values from `.env.secrets` file
5. Deploy

### For Netlify (Frontend)
1. Go to https://app.netlify.com
2. Your site → Site settings → Environment variables
3. Add each variable from `.env.secrets`
4. Trigger new deploy

---

## 🛡️ Security Best Practices

1. ✅ **Never commit `.env` files to Git**
2. ✅ **Use `.env.secrets` as local reference only**
3. ✅ **Rotate keys if accidentally exposed**
4. ✅ **Use different keys for dev/prod**
5. ✅ **Keep secrets in deployment platform dashboards**

---

## 🔧 If You Need to Rotate Keys

### Supabase
1. Go to: https://supabase.com/dashboard
2. Project Settings → API
3. Generate new service role key
4. Update in all deployment platforms

### Gemini AI
1. Go to: https://aistudio.google.com/apikey
2. Create new API key
3. Update in all deployment platforms

---

## ✅ Current Setup

- `.env.secrets` - Contains all actual keys (local reference)
- `.gitignore` - Blocks `.env.secrets` from being committed
- Documentation files - Use placeholder values only

**Your secrets are safe! 🔒**
