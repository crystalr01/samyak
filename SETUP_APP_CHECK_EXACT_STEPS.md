# 🔧 Set Up App Check - Exact Steps to Enable Real SMS

## Why Real Numbers Don't Work:

Firebase Phone Auth on web requires **App Check** to send SMS to real numbers.
- Test numbers: Work without App Check ✅
- Real numbers: Require App Check ❌

You MUST complete this setup to send OTP to real phone numbers.

---

## ✅ EXACT STEPS (10 Minutes):

### STEP 1: Open App Check

Click this link:
```
https://console.firebase.google.com/project/digital-cards-38a1d/appcheck
```

---

### STEP 2: Click "Apps" Tab

At the top of the page, you'll see two tabs:
- **Products**
- **Apps** ← **CLICK THIS**

---

### STEP 3: Register Your Web App

You'll see: "No apps registered yet"

1. Click **"Register app"** button (big blue button)

2. You'll see platform options:
   - iOS
   - Android  
   - **Web** ← **CLICK THIS (globe icon)**

3. A form appears with:
   - **App nickname**: Enter `Samyak Shadi Web`
   - **App ID**: Should auto-fill with `1:73437948325:web:84399a6cb24614bda8604c`
   
4. Click **"Register app"** button

---

### STEP 4: Configure reCAPTCHA

After registering, you'll see "Configure App Check" screen:

1. **Choose provider**: Select **"reCAPTCHA v3"** (NOT Enterprise)

2. **reCAPTCHA site key**: Enter this exactly:
   ```
   6Lcki2EsAAAAAKUdSj4cf9QhyDi8cvkqPQEEpQHj
   ```

3. Click **"Save"** button

---

### STEP 5: Configure Authentication API

1. Click on **"Products"** tab (at the top, next to "Apps")

2. You'll see a list of APIs/Products

3. Find **"Authentication"** in the list (might also be called "Identity Toolkit API")

4. Click on it

5. You'll see enforcement options:
   - **Enforce**: Requires App Check (strict)
   - **Unenforced**: Allows without App Check (for testing)

6. Select **"Unenforced"** (for now, to test)

7. Click **"Save"**

---

### STEP 6: Verify Setup

Go back to **"Apps"** tab and verify:
- Your web app "Samyak Shadi Web" is listed
- Status shows as "Active" or "Registered"
- Provider shows "reCAPTCHA v3"

---

### STEP 7: Test with Real Number

1. **Refresh your app** (Ctrl+R or Cmd+R)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Try real phone number**: `9370329233`
4. **Click "Send OTP"**
5. **You should receive real SMS!** 📱

---

## 🎯 Visual Guide:

### What You'll Click:

```
Firebase Console
    ↓
App Check
    ↓
"Apps" tab (top of page)
    ↓
"Register app" button
    ↓
"Web" icon
    ↓
Enter nickname: "Samyak Shadi Web"
    ↓
"Register app" button
    ↓
Select "reCAPTCHA v3"
    ↓
Enter site key: 6Lcki2EsAAAAAKUdSj4cf9QhyDi8cvkqPQEEpQHj
    ↓
"Save" button
    ↓
"Products" tab
    ↓
Click "Authentication"
    ↓
Select "Unenforced"
    ↓
"Save" button
    ↓
Done! ✅
```

---

## ⚠️ Important Notes:

1. **Must use exact site key**: `6Lcki2EsAAAAAKUdSj4cf9QhyDi8cvkqPQEEpQHj`
2. **Choose reCAPTCHA v3** (not Enterprise)
3. **Set to "Unenforced"** for testing
4. **Refresh app** after setup
5. **Clear browser cache** if still not working"

---

## 🐛 If Still Not Working:

### Check These:

1. **App Check → Apps tab**:
   - Web app should be listed
   - Status should be "Active"

2. **App Check → Products tab**:
   - Authentication should show "Unenforced"

3. **Clear browser completely**:
   - Press Ctrl+Shift+Delete
   - Clear "Cached images and files"
   - Clear "Cookies and other site data"
   - Click "Clear data"

4. **Restart your app**:
   ```bash
   # Stop the app (Ctrl+C)
   npm start
   ```

5. **Check Firebase Console logs**:
   - Go to: https://console.firebase.google.com/project/digital-cards-38a1d/authentication/users
   - Look for any error messages

---

## ✅ Success Indicators:

### You'll know it's working when:

**In Browser Console:**
```javascript
✅ Attempting to send OTP to: +919370329233
✅ reCAPTCHA solved successfully
✅ OTP sent successfully
✅ User authenticated successfully
```

**On Your Phone:**
```
📱 SMS received with 6-digit code
```

**In Your App:**
```
✅ "OTP sent successfully! Please check your phone."
✅ Enter the code from SMS
✅ Login successful!
```

**No More Errors:**
```
❌ No more: auth/invalid-app-credential
❌ No more: 400 Bad Request
❌ No more: Timeout errors
```

---

## 💰 About Billing:

After App Check is set up, you'll also need **Blaze plan** for real SMS:

1. Go to: https://console.firebase.google.com/project/digital-cards-38a1d/usage
2. Verify plan is "Blaze (Pay as you go)"
3. Add payment method if not already added
4. Set budget alerts (recommended: ₹500-1000/month)

**Cost**: ~₹0.50-1.00 per SMS in India

---

## 🎯 Quick Checklist:

- [ ] Opened App Check in Firebase Console
- [ ] Clicked "Apps" tab
- [ ] Clicked "Register app"
- [ ] Selected "Web"
- [ ] Entered nickname: "Samyak Shadi Web"
- [ ] Clicked "Register app"
- [ ] Selected "reCAPTCHA v3"
- [ ] Entered site key: 6Lcki2EsAAAAAKUdSj4cf9QhyDi8cvkqPQEEpQHj
- [ ] Clicked "Save"
- [ ] Went to "Products" tab
- [ ] Found "Authentication"
- [ ] Set to "Unenforced"
- [ ] Clicked "Save"
- [ ] Refreshed app
- [ ] Cleared browser cache
- [ ] Tested with real number
- [ ] Received SMS! ✅

---

**This is the ONLY way to send OTP to real phone numbers on web apps. You must complete this setup!** 🚀
