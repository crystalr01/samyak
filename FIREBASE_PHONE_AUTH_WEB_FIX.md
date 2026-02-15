# 🔧 Fix: auth/invalid-app-credential (Phone Auth Enabled But Still Not Working)

## Your Situation:
- ✅ Phone Authentication is **ENABLED** in Firebase Console
- ❌ Still getting `auth/invalid-app-credential` error
- ❌ Error: "Failed to initialize reCAPTCHA Enterprise config"

## Root Causes & Solutions:

---

## Solution 1: Enable App Check (Most Common Fix for Web)

Firebase Phone Auth on web requires **App Check** to be configured.

### Steps:

1. **Go to Firebase Console**
   - https://console.firebase.google.com/
   - Select project: `digital-cards-38a1d`

2. **Navigate to App Check**
   - Click **"App Check"** in left sidebar (under Build section)
   - Or go directly: https://console.firebase.google.com/project/digital-cards-38a1d/appcheck

3. **Register Your Web App**
   - Click **"Apps"** tab
   - Find your web app or click **"Register app"**
   - Select **"Web"**

4. **Configure reCAPTCHA**
   - Choose **"reCAPTCHA v3"** or **"reCAPTCHA Enterprise"**
   - For reCAPTCHA v3:
     - Get site key from: https://www.google.com/recaptcha/admin
     - Or use the one in your code: `6Lcki2EsAAAAAKUdSj4cf9QhyDi8cvkqPQEEpQHj`
   - Click **"Save"**

5. **Enable Enforcement**
   - Go to **"APIs"** tab in App Check
   - Find **"Identity Toolkit API"** (this is Firebase Auth)
   - Toggle **"Enforce"** to ON
   - Or set to **"Unenforced"** for testing

---

## Solution 2: Verify Authorized Domains

Even though Phone is enabled, domains must be properly configured.

### Steps:

1. **Go to Authentication → Settings**
   - https://console.firebase.google.com/project/digital-cards-38a1d/authentication/settings

2. **Check Authorized Domains**
   - Should include:
     - `localhost`
     - `digital-cards-38a1d.firebaseapp.com`
     - Your production domain

3. **Add Missing Domains**
   - Click **"Add domain"**
   - Add: `localhost` (if missing)
   - Add: `127.0.0.1` (if testing locally)

---

## Solution 3: Check Billing Status

Phone Auth requires Blaze plan with active billing.

### Steps:

1. **Check Current Plan**
   - Go to: https://console.firebase.google.com/project/digital-cards-38a1d/usage

2. **Verify Billing is Active**
   - Should show **"Blaze (Pay as you go)"**
   - Payment method should be added
   - No billing alerts

3. **If Billing Not Set Up**
   - Click **"Modify plan"**
   - Add payment method
   - Confirm billing is active

---

## Solution 4: Use Test Phone Numbers (For Development)

While fixing the issue, use test phone numbers that don't require SMS.

### Steps:

1. **Go to Authentication → Sign-in method**
   - Scroll to **"Phone numbers for testing"**
   - Click to expand

2. **Add Test Number**
   - Phone: `+91 650-555-1234` (example)
   - Code: `123456`
   - Click **"Add"**

3. **Test with This Number**
   - Use the test number in your app
   - It won't send real SMS
   - Use the fixed code you set

---

## Solution 5: Clear and Recreate reCAPTCHA Verifier

Sometimes the verifier gets stuck. Let's force a clean setup.

### Update Your Code:

Add this to your `SubscriptionPlans.js`:

```javascript
const setupRecaptcha = () => {
    const auth = getAuth();
    
    // Force clear any existing verifier
    if (window.recaptchaVerifierPlans) {
        try {
            window.recaptchaVerifierPlans.clear();
            delete window.recaptchaVerifierPlans;
        } catch (error) {
            console.log('Error clearing verifier:', error);
        }
    }
    
    // Clear the container
    const container = document.getElementById('recaptcha-container-plans');
    if (container) {
        container.innerHTML = '';
    }
    
    // Create fresh verifier
    window.recaptchaVerifierPlans = new RecaptchaVerifier(auth, 'recaptcha-container-plans', {
        'size': 'normal', // Try 'normal' instead of 'invisible' for debugging
        'callback': (response) => {
            console.log('reCAPTCHA solved successfully', response);
        },
        'expired-callback': () => {
            setLoginMessage('reCAPTCHA expired. Please try again.');
            setLoginLoading(false);
        }
    });
    
    return window.recaptchaVerifierPlans;
};
```

---

## Solution 6: Check Firebase Project Configuration

Verify your Firebase config is correct.

### Check `src/firebaseConfig.js`:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDSA9eYdtVzF-8OhVQ0kK2kP8oZLSOMNFs",
    authDomain: "digital-cards-38a1d.firebaseapp.com",
    databaseURL: "https://digital-cards-38a1d-default-rtdb.firebaseio.com",
    projectId: "digital-cards-38a1d",
    storageBucket: "digital-cards-38a1d.firebasestorage.app",
    messagingSenderId: "73437948325",
    appId: "1:73437948325:web:84399a6cb24614bda8604c",
    measurementId: "G-44VCXH55RZ"
};
```

**Verify:**
- `authDomain` matches your Firebase project
- `projectId` is correct
- `apiKey` is valid

---

## Solution 7: Enable Identity Toolkit API

Phone Auth uses Identity Toolkit API which must be enabled.

### Steps:

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/
   - Select project: `digital-cards-38a1d`

2. **Enable Identity Toolkit API**
   - Go to: APIs & Services → Library
   - Search: "Identity Toolkit API"
   - Click on it
   - Click **"Enable"**

3. **Also Enable These APIs**
   - Identity Platform API
   - Cloud Functions API (if using)

---

## Solution 8: Check Browser Console for Detailed Errors

### Look for These Specific Messages:

1. **"Failed to initialize reCAPTCHA Enterprise config"**
   - Solution: Configure App Check (Solution 1)

2. **"Token mismatch"**
   - Solution: Clear browser cache and cookies
   - Regenerate Firebase config

3. **"Domain not authorized"**
   - Solution: Add domain to authorized domains (Solution 2)

4. **"Billing not enabled"**
   - Solution: Set up billing (Solution 3)

---

## Quick Test: Use Visible reCAPTCHA

Change from invisible to visible reCAPTCHA to see if that helps:

### In `SubscriptionPlans.js`:

```javascript
window.recaptchaVerifierPlans = new RecaptchaVerifier(auth, 'recaptcha-container-plans', {
    'size': 'normal', // Changed from 'invisible'
    'callback': (response) => {
        console.log('reCAPTCHA solved successfully');
    },
    'expired-callback': () => {
        setLoginMessage('reCAPTCHA expired. Please try again.');
    }
});
```

This will show a visible reCAPTCHA checkbox for debugging.

---

## Debugging Checklist:

Run through this checklist:

- [ ] Phone Authentication is enabled in Firebase Console
- [ ] App Check is configured (or set to unenforced)
- [ ] `localhost` is in authorized domains
- [ ] Billing is active (Blaze plan)
- [ ] Identity Toolkit API is enabled in Google Cloud
- [ ] Firebase config in code matches console
- [ ] Browser cache cleared
- [ ] Using latest Firebase SDK version
- [ ] No ad blockers interfering with reCAPTCHA
- [ ] Console shows no CORS errors

---

## Most Likely Solution:

Based on your error, the most likely fix is **Solution 1: Enable App Check**.

Firebase Phone Auth on web now requires App Check to prevent abuse. Follow these exact steps:

1. Go to: https://console.firebase.google.com/project/digital-cards-38a1d/appcheck
2. Click **"Apps"** tab
3. Register your web app
4. Configure reCAPTCHA v3
5. Go to **"APIs"** tab
6. Find **"Identity Toolkit API"**
7. Set to **"Unenforced"** (for testing) or **"Enforce"** (for production)
8. Save and test again

---

## Alternative: Use Test Phone Numbers

While debugging, use test phone numbers:

1. Firebase Console → Authentication → Sign-in method
2. Scroll to "Phone numbers for testing"
3. Add: `+91 9370329233` with code `123456`
4. Test with this number - no SMS sent, no billing required

---

## Still Not Working?

If none of these work, try:

1. **Create a new Firebase project** and test there
2. **Check Firebase Status**: https://status.firebase.google.com/
3. **Contact Firebase Support** with your project ID
4. **Use Firebase Auth Emulator** for local testing

---

## Expected Result After Fix:

```javascript
✅ Attempting to send OTP to: +919370329233
✅ reCAPTCHA solved successfully
✅ OTP sent successfully
✅ SMS received on phone
```

---

**Start with Solution 1 (App Check) - that's the most common fix for this error!**
