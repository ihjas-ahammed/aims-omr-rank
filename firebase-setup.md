# Firebase Setup for Online Exams

To use the Online Exams feature, you need to connect the app to a Firebase project.

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the steps.

### 2. Enable Firestore Database
1. In your Firebase project, go to **Build > Firestore Database**.
2. Click **Create database**.
3. Start in **Test mode** (for initial development) or update your security rules to allow read/write access.
   *(Recommended minimal rules for production: allow read for exams, allow create for submissions, require admin for reading submissions).*

### 3. Get Your Firebase Config
1. Go to **Project Settings** (the gear icon on the top left).
2. Under the "General" tab, scroll down to "Your apps".
3. Click the **Web** icon (`</>`) to add a web app.
4. Register the app and copy the `firebaseConfig` object values.

### 4. Add Environment Variables
Create a `.env.local` file in your project root (next to `package.json`) and add your Firebase config values:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```

Restart your Vite development server for the variables to take effect (`npm run dev`).