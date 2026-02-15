# 🔧 App Check Setup - Fix "Unknown Origin Requests"

## What You're Seeing:
- App Check dashboard shows: **100% Unverified: unknown origin requests**
- This means your web app is not registered with App Check
- That's why you're getting `auth/invalid-app-credential` error

---

## ✅ SOLUTION: Register Your Web App with App Check

### Step 1: Click on "Apps" Tab

In your current App Check screen:
1. Look at the top of the page
2. You'll see tabs: **"Products"** and **"Apps"**
3. Click on **"Apps"** tab

---

### Step 2: Register Your Web App

You'll see a page that says:
```
No apps registered yet
Register your apps to get started with App Check
```

**Do this:**
1. Click **"Register app"** button (or **"Add app"**)
2. Select **"Web"** (globe icon)

---

### Step 3: Configure Web App

A form will appear:

**App nickname:**
```
Samyak Shadi Web
```

**App ID:**
```
(This should auto-fill from your Firebase config)
1:73437948325:web:84399a6cb24614bda8604c
```

**Click "Register app"**

---

### Step 4: Choose reCAPTCHA Provider

After registering, you'll be asked to choose a provider:

**Select: "reCAPTCHA v3"**

**reCAPTCHA site key:**
```
6Lcki2EsAAAAAKUdSj4cf9QhyDi8cvkqPQEEpQHj
```
(This is the key from your code)

**Click "Save"**

---

### Step 5: Configure Authentication API

1. Go back to **"Products"** tab (or it might be called "APIs")
2. Find **"Authentication"** or **"Identity Toolkit API"** in the list
3. Click on it
4. You'll see enforcement options:
   - **For testing**: Select **"Unenforced"**
   - **For production**: Select **"Enforce"**
5. Click **"Save"**

---

### Step 6: Test Your App

1. Go back to your app: http://localhost:3000
2. Try sending OTP again
3. Should work now! ✅

---

## 🎯 ALTERNATIVE: Disable App Check Enforcement (Quick Fix)

If you want to test without App Check right now:

### Option 1: Set Authentication to "Unenforced"

1. In App Check, go to **"Products"** tab
2. Find **"Authentication"**
3. Set to **"Unenforced"**
4. This allows requests without App Check verification

### Option 2: Use Test Phone Numbers (Recommended)

This bypasses the App Check requirement entirely:

1. Go to: **Authentication** → **Sign-in method**
2. Scroll to **"Phone numbers for testing"**
3. Add test number:
   - Phone: `+919370329233`
   - Code: `123456`
4. Test with this number - no App Check needed!

---

## 📋 DETAILED WALKTHROUGH:

### Current Screen: App Check → Products

You're seeing:
```
┌─────────────────────────────────────────────┐
│ App Check                                   │
├─────────────────────────────────────────────┤
│ [Products] [Apps]  ← CLICK "Apps" TAB      │
├─────────────────────────────────────────────┤
│                                             │
│ App Check request metrics                   │
│ Unverified: unknown origin requests: 100%   │
│                                             │
└─────────────────────────────────────────────┘
```

### After Clicking "Apps" Tab:

You'll see:
```
┌─────────────────────────────────────────────┐
│ App Check                                   │
├─────────────────────────────────────────────┤
│ [Products] [Apps]  ← YOU'RE HERE NOW       │
├─────────────────────────────────────────────┤
│                                             │
│ No apps registered yet                      │
│ Register your apps to get started           │
│                                             │
│ [Register app]  ← CLICK THIS               │
│                                             │
└─────────────────────────────────────────────┘
```

### After Clicking "Register app":

Choose platform:
```
┌─────────────────────────────────────────────┐
│ Register app                                │
├─────────────────────────────────────────────┤
│                                             │
│ Select platform:                            │
│                                             │
│  [ iOS ]  [ Android ]  [ Web ]  ← CLICK WEB│
│                                             │
└─────────────────────────────────────────────┘
```

### After Selecting Web:

Fill in details:
```
┌─────────────────────────────────────────────┐
│ Register web app                            │
├─────────────────────────────────────────────┤
│                                             │
│ App nickname:                               │
│ [Samyak Shadi Web              ]            │
│                                             │
│ App ID:                                     │
│ [1:73437948325:web:84399a6cb24614bda8604c] │
│                                             │
│              [Cancel]  [Register app]       │
│                                             │
└─────────────────────────────────────────────┘
```

### After Registering:

Configure provider:
```
┌─────────────────────────────────────────────┐
│ Configure App Check                         │
├─────────────────────────────────────────────┤
│                                             │
│ Choose provider:                            │
│ ○ reCAPTCHA Enterprise                      │
│ ● reCAPTCHA v3  ← SELECT THIS              │
│                                             │
│ reCAPTCHA site key:                         │
│ [6Lcki2EsAAAAAKUdSj4cf9QhyDi8cvkqPQEEpQHj]│
│                                             │
│              [Cancel]  [Save]               │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 MY RECOMMENDATION:

### For Immediate Testing (Easiest):

**Use Test Phone Numbers** - This completely bypasses App Check:

1. Don't worry about App Check for now
2. Go to: Authentication → Sign-in method
3. Add test phone number: `+919370329233` with code `123456`
4. Test your app - works immediately!
5. No App Check configuration needed

### For Production (Later):

1. Complete App Check setup (steps above)
2. Register web app
3. Configure reCAPTCHA v3
4. Set Authentication to "Enforce"
5. Test with real phone numbers

---

## 🚀 FASTEST PATH TO WORKING APP:

```
1. Skip App Check for now
   ↓
2. Use Test Phone Numbers instead
   ↓
3. Test your app (works in 2 minutes!)
   ↓
4. Configure App Check later for production
```

---

## 📞 Test Phone Number Setup (2 Minutes):

### Direct Link:
```
https://console.firebase.google.com/project/digital-cards-38a1d/authentication/providers
```

### Steps:
1. Click link above
2. Scroll to "Phone numbers for testing"
3. Click "+ Add phone number"
4. Enter:
   - Phone: `+919370329233`
   - Code: `123456`
5. Click "Add"
6. Test in your app!

---

## ✅ SUCCESS INDICATORS:

### After App Check Setup:
- "Unknown origin requests" drops to 0%
- "Verified requests" shows 100%
- No more `auth/invalid-app-credential` error

### After Test Phone Number:
- Can send OTP without errors
- No real SMS sent
- Fixed code `123456` works
- Login successful!

---

## 🎯 CHOOSE YOUR PATH:

### Path A: App Check (10 minutes, for production)
→ Follow steps 1-6 above
→ Register web app
→ Configure reCAPTCHA
→ Set enforcement

### Path B: Test Numbers (2 minutes, for testing)
→ Go to Authentication
→ Add test phone number
→ Test immediately
→ Works without App Check!

---

**I recommend Path B (Test Numbers) for immediate testing!** 🚀

You can always set up App Check later before production deployment.
