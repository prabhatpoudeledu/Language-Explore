<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1c5r9Wmu8-yEfEgddB0CYsHKMCKQWU38o

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Tests

Run unit tests with:

`npm test`

Watch mode:

`npm run test:watch`

## Mobile (Capacitor)

This project can be packaged for Android/iOS using Capacitor.

### Android (Windows)

1. Build + sync:
   `npm run cap:sync`
2. Create Android project (first time only):
   `npx cap add android`
3. Open in Android Studio:
   `npm run cap:android`

### Android Live Reload

1. Start the dev server:
   `npm run dev -- --host`
2. Run the Android app with live reload:
   `npm run cap:android:live`

### iOS (macOS only)

1. Build + sync:
   `npm run cap:sync`
2. Create iOS project (first time only):
   `npx cap add ios`
3. Open in Xcode:
   `npx cap open ios`
