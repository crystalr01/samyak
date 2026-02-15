# Firebase Storage Setup Guide

## Issue
You're getting CORS errors when trying to upload images to Firebase Storage because Firebase Storage is not properly configured for your project.

## Solution Steps

### Step 1: Enable Firebase Storage
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **digital-cards-38a1d**
3. Click on **"Storage"** in the left sidebar
4. If Storage is not enabled, click **"Get Started"**
5. Click **"Next"** and then **"Done"**

### Step 2: Configure Storage Rules
1. In Firebase Console > Storage
2. Click on the **"Rules"** tab
3. Replace the existing rules with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

4. Click **"Publish"**

**Note:** These rules allow anyone to read/write. For production, you should add authentication:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 3: Verify Storage Bucket
1. In Firebase Console > Project Settings (gear icon)
2. Scroll down to **"Your apps"** section
3. Verify the **Storage bucket** value is: `digital-cards-38a1d.appspot.com`
4. This should match the value in your `firebaseConfig.js`

### Step 4: Check CORS Configuration (If Still Having Issues)
If you still get CORS errors after the above steps:

1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Login to Google Cloud:
   ```bash
   gcloud auth login
   ```
3. Set your project:
   ```bash
   gcloud config set project digital-cards-38a1d
   ```
4. Create a file named `cors.json`:
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET", "POST", "PUT", "DELETE"],
       "maxAgeSeconds": 3600
     }
   ]
   ```
5. Apply CORS configuration:
   ```bash
   gsutil cors set cors.json gs://digital-cards-38a1d.appspot.com
   ```

### Step 5: Test the Upload
1. Go to your admin settings page
2. Click "Edit" on QR Payment Settings
3. Click "Choose Image" and select a QR code image
4. Click "Upload to Firebase Storage"
5. The image should upload successfully and the URL will be saved

## How It Works Now

1. **User selects image** → File is validated (type and size)
2. **Click "Upload to Firebase Storage"** → Image is uploaded to `qr-codes/` folder in Firebase Storage
3. **Get download URL** → Firebase returns a permanent public URL
4. **Save to Realtime Database** → The download URL is saved to `Matrimony/Qr/imageUrl`
5. **Display everywhere** → The URL can be used in `<img>` tags throughout the app

## File Structure in Firebase Storage
```
digital-cards-38a1d.appspot.com/
└── qr-codes/
    ├── qr_1770296717819.png
    ├── qr_1770296718234.jpg
    └── ...
```

## Troubleshooting

### Error: "storage/unauthorized"
- Firebase Storage rules are too restrictive
- Follow Step 2 to update rules

### Error: "storage/bucket-not-found"
- Storage is not enabled for your project
- Follow Step 1 to enable Storage

### Error: CORS policy error
- CORS is not configured
- Follow Step 4 to configure CORS

### Error: "Failed to load resource: net::ERR_NAME_NOT_RESOLVED"
- Wrong storage bucket URL
- Verify Step 3 and ensure `storageBucket: "digital-cards-38a1d.appspot.com"`

## Current Configuration

Your `firebaseConfig.js` is already set up correctly:
```javascript
storageBucket: "digital-cards-38a1d.appspot.com"
```

The code will:
- Upload images to Firebase Storage
- Get the download URL (e.g., `https://firebasestorage.googleapis.com/v0/b/digital-cards-38a1d.appspot.com/o/qr-codes%2Fqr_1770296717819.png?alt=media&token=...`)
- Save this URL to Realtime Database
- Use the URL to display images

## After Configuration

Once Firebase Storage is properly configured, the upload will work automatically. No code changes needed!
