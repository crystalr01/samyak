# Google reCAPTCHA Enterprise Integration

## Overview
Integrated Google reCAPTCHA Enterprise v3 for bot protection during login/OTP flow.

## Implementation

### 1. HTML Script Added
**File:** `public/index.html`

```html
<script src="https://www.google.com/recaptcha/enterprise.js?render=6Lcki2EsAAAAAKUdSj4cf9QhyDi8cvkqPQEEpQHj"></script>
```

### 2. Login Components Updated

**Files:**
- `src/components/pages/UserLogin.js`
- `src/components/pages/SubscriptionPlans.js`

**Flow:**
1. User enters phone number
2. Clicks "Send OTP"
3. reCAPTCHA Enterprise executes invisibly
4. Token is generated with action: 'LOGIN'
5. Token is logged to console (for demo)
6. In production, send token to backend for verification

### 3. Current Mode: DEMO

**Demo Behavior:**
- reCAPTCHA token is generated and logged
- OTP is always: **123456**
- No backend verification (for testing)
- Works with any 10-digit phone number

### 4. Production Implementation

To enable real OTP with reCAPTCHA verification:

#### Backend API Required:
```javascript
// POST /api/send-otp
{
  "phoneNumber": "+919876543210",
  "recaptchaToken": "03AGdBq24..."
}
```

#### Backend Steps:
1. Receive phone number and reCAPTCHA token
2. Verify token with Google reCAPTCHA Enterprise API:
   ```
   POST https://recaptchaenterprise.googleapis.com/v1/projects/YOUR_PROJECT/assessments?key=YOUR_API_KEY
   ```
3. Check score (0.0 - 1.0, higher is better)
4. If score > 0.5, send OTP via SMS gateway
5. Return success/failure

#### Frontend Code (Uncomment in production):
```javascript
const response = await fetch('/api/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        phoneNumber: `+91${phoneNumber}`,
        recaptchaToken: token
    })
});

if (response.ok) {
    setShowOtpInput(true);
    setAlertMessage('OTP sent successfully!');
}
```

## reCAPTCHA Site Key
**Site Key:** `6Lcki2EsAAAAAKUdSj4cf9QhyDi8cvkqPQEEpQHj`

This is used in:
- HTML script tag (render parameter)
- JavaScript execute call

## How It Works

### User Flow:
1. User enters phone number
2. Clicks "Send OTP"
3. reCAPTCHA runs invisibly (no challenge)
4. Token generated and sent to backend
5. Backend verifies token with Google
6. Backend sends OTP via SMS
7. User enters OTP
8. User logs in

### Security Benefits:
- Prevents bot attacks
- No user interaction needed (invisible)
- Score-based risk assessment
- Action-specific tokens ('LOGIN')

## Testing

### Current Demo Mode:
```
Phone: Any 10-digit number
OTP: 123456
```

### Check reCAPTCHA Token:
1. Open browser console
2. Enter phone number
3. Click "Send OTP"
4. See log: "reCAPTCHA token obtained: ..."

## Configuration Needed for Production

### 1. Google Cloud Console:
- Enable reCAPTCHA Enterprise API
- Create assessment key
- Get API key for backend verification

### 2. Backend Setup:
- Create `/api/send-otp` endpoint
- Integrate SMS gateway (Twilio, AWS SNS, etc.)
- Verify reCAPTCHA tokens
- Store OTP temporarily (Redis/Database)

### 3. Frontend:
- Uncomment production code sections
- Remove demo mode code
- Update API endpoint URLs

## Error Handling

### If reCAPTCHA Fails:
- Falls back to demo mode
- Shows message: "reCAPTCHA verification failed. Using demo mode."
- Still allows login for testing

### If reCAPTCHA Not Loaded:
- Checks `window.grecaptcha.enterprise`
- Falls back to demo mode if not available
- Logs warning to console

## Notes

- reCAPTCHA Enterprise v3 is invisible (no checkbox)
- Generates risk score (0.0 - 1.0)
- Action parameter helps Google understand context
- Token is single-use and expires quickly
- Backend must verify token server-side

## Next Steps for Production

1. ✅ reCAPTCHA script added to HTML
2. ✅ Token generation implemented
3. ⏳ Create backend API endpoint
4. ⏳ Integrate SMS gateway
5. ⏳ Verify reCAPTCHA tokens on backend
6. ⏳ Store and verify OTPs
7. ⏳ Uncomment production code
8. ⏳ Remove demo mode
