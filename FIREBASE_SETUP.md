# Firebase Setup Instructions

To enable real-time report sharing across all users, you'll need to set up a Firebase project.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it "firemap-webapp" (or any name you prefer)
4. Enable Google Analytics (optional)
5. Create project

## Step 2: Enable Realtime Database

1. In your Firebase project, go to "Realtime Database"
2. Click "Create Database"
3. Choose "Start in test mode" (for now)
4. Select your preferred location

## Step 3: Get Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app icon
4. Register app with name "Fire Map"
5. Copy the configuration object

## Step 4: Update reports.js

Replace the placeholder config in `reports.js` with your real config:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

## Step 5: Security Rules (Optional)

For production, update your Realtime Database rules:

```json
{
  "rules": {
    "reports": {
      ".read": true,
      ".write": true,
      "$reportId": {
        ".validate": "newData.hasChildren(['id', 'type', 'severity', 'description', 'lat', 'lng', 'timestamp'])"
      }
    }
  }
}
```

## Step 6: Test

1. Open your app in multiple browsers/devices
2. Submit a report on one device
3. Check if it appears on other devices automatically

That's it! Reports will now sync across all users in real-time.
