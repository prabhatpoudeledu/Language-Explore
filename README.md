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
2. Set the `GEMINI_API_KEY` and `VITE_GOOGLE_CLIENT_ID` in [.env.local](.env.local)
3. Run the app:
   `npm run dev`

## Content Packs (JSON)

Static learning content is exported to JSON files under public/content. This keeps updates easy without code changes.

Export content:
`node scripts/export-content.mjs`

The export script writes:
- public/content/np/alphabet.json
- public/content/np/numbers.json
- public/content/np/vocabulary.json
- public/content/np/quiz.json

To serve content from a CDN later, set:
`VITE_CONTENT_BASE_URL=https://your-cdn-domain`

## Serverless Proxy (Keep API Key Private)

If you deploy the frontend to static hosting, move Gemini calls to a serverless proxy so your API key is not exposed.

### Netlify Functions (Recommended)

1. Deploy this repo to Netlify.
2. Add environment variables in Netlify:
   `GEMINI_API_KEY=your_key_here`
   `GEMINI_PROXY_TOKEN=your_proxy_token`
   `GEMINI_ALLOWED_ORIGINS=https://your-domain.com`
3. Set your frontend to use the proxy by adding this in your frontend env:
   `VITE_GEMINI_PROXY_URL=/.netlify/functions/gemini-proxy`
   `VITE_GEMINI_PROXY_TOKEN=your_proxy_token`

Local testing with Netlify:
`npx netlify dev`

### Hostinger Serverless

Use the included handler template:
[serverless/hostinger/gemini-proxy.js](serverless/hostinger/gemini-proxy.js)

1. Create a serverless function in Hostinger and paste the handler.
2. Add environment variable:
   `GEMINI_API_KEY=your_key_here`
   `GEMINI_PROXY_TOKEN=your_proxy_token`
   `GEMINI_ALLOWED_ORIGINS=https://your-domain.com`
3. Set frontend env:
   `VITE_GEMINI_PROXY_URL=https://your-hostinger-domain/api/gemini-proxy`
   `VITE_GEMINI_PROXY_TOKEN=your_proxy_token`

After setting env variables, restart your dev server.

## Security Headers (Recommended)

### Netlify
Headers are already configured in [netlify.toml](netlify.toml).

### Hostinger (Apache)
If you use Apache hosting, add these headers in your `.htaccess`:

```apache
Header set Content-Security-Policy "default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; script-src 'self'; connect-src 'self' https://generativelanguage.googleapis.com; media-src 'self' data: blob:; frame-ancestors 'none'; base-uri 'self'"
Header set Referrer-Policy "strict-origin-when-cross-origin"
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "DENY"
Header set Permissions-Policy "camera=(), microphone=(), geolocation=()"
```

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

## Android Build (APK/AAB)

1. Build + sync:
   `npm run cap:sync`
2. Open in Android Studio:
   `npx cap open android`
3. In Android Studio, use **Build > Build Bundle(s) / APK(s)**

## iOS Build (App)

1. Build + sync:
   `npm run cap:sync`
2. Open in Xcode:
   `npx cap open ios`
3. Set your signing team in **Signing & Capabilities**
4. Use **Product > Archive** to create a build

## When Native Code Is Needed

You do not need extra native code for standard web features. Add platform-specific code only when using native device capabilities such as:

- Camera, microphone, or file system access
- Push notifications
- Background tasks or deep OS integrations

In those cases, install the appropriate Capacitor plugin and follow its iOS/Android setup steps.
