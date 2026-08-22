# 🔧 Vercel Node Version Fix - MANUAL STEPS REQUIRED

## ⚠️ The Issue

Vercel is using Node.js v24.19.0 instead of Node 18, causing the Rollup native module error.

The `.node-version` file isn't being respected. We need to configure this manually in Vercel's dashboard.

---

## ✅ SOLUTION: Configure in Vercel Dashboard

### Step 1: Go to Vercel Project Settings

1. Open: https://vercel.com/dashboard
2. Click your **cognivia** project
3. Click **Settings** (top menu)

### Step 2: Set Node.js Version

1. In left sidebar, click **General**
2. Scroll to **"Node.js Version"** section
3. Click the dropdown
4. Select **18.x** (NOT 20.x or 24.x)
5. Click **Save**

**This is CRITICAL!** ⚠️

---

### Step 3: Redeploy

After saving Node version:

1. Go to **Deployments** tab
2. Click the latest deployment
3. Click the **"..."** menu (top right)
4. Click **"Redeploy"**
5. Keep "Use existing Build Cache" **UNCHECKED**
6. Click **"Redeploy"**

---

## 🎯 Expected Result

**After setting Node 18 and redeploying:**

```
✓ Using Node.js 18.x
✓ Installing dependencies
✓ @rollup/rollup-linux-x64-gnu installed successfully
✓ Building with Vite
✓ Build completed
✓ Deployment successful! 🎉
```

---

## 📋 Alternative: Set via Environment Variable

If the above doesn't work, try this:

### In Vercel Dashboard:

1. Settings → **Environment Variables**
2. Click **"Add New"**
3. Set:
   ```
   Key: NODE_VERSION
   Value: 18
   ```
4. Select: All (Production, Preview, Development)
5. Click **"Save"**
6. **Redeploy** as described above

---

## 🚨 Why This Happened

Vercel recently updated their default Node.js version to 24.x, but:
- Vite 5.3.4 expects Node 18 or 20
- The Rollup native module for Node 24 isn't available yet
- Our `.node-version` file should work but sometimes Vercel's UI setting takes precedence

---

## ✅ Verification

**After redeploying with Node 18:**

Look for this in build logs:
```
✓ Node.js version: v18.x.x  ← Should show 18, NOT 24
✓ Installing dependencies
✓ Building application
```

---

## 🎯 Do This NOW

1. **Open Vercel Dashboard**: https://vercel.com/dashboard
2. **Your project** → **Settings** → **General**
3. **Node.js Version** → Select **18.x**
4. **Save**
5. **Deployments** → Latest → **"..."** → **Redeploy** (no cache)
6. **Watch build logs** - should succeed!

---

## 📞 If Still Failing

If it still fails after setting Node 18:

1. **Screenshot the error**
2. **Check Node version in logs** (should show v18.x.x)
3. **Let me know** - we'll try a different approach

---

**Go do this now! It's a 2-minute fix in the Vercel dashboard! 🚀**
