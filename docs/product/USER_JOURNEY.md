# User Journey: NovaSphere AI Social Media Platform

## Journey 1: First-Time Onboarding & Account Connection
1. **Sign Up / Login:** User logs in at `http://localhost:3005/login` with email and password or Google OAuth.
2. **Account Connection Wizard (`/accounts`):**
   - **Telegram:** Guided 4-step wizard:
     - Step 1: Open `@BotFather` and run `/newbot`.
     - Step 2: Paste HTTP API Token (encrypted with AES-256-GCM).
     - Step 3: Add bot as Administrator in channel with "Post Messages" permission.
     - Step 4: Input `@channel_username` or `-100...` chat ID.
   - **Instagram:** Connect Meta Business Profile with access token. System automatically discovers connected Pages and Instagram accounts.
   - **YouTube:** Connect YouTube Creator channel via Google OAuth with `youtube.upload` scope.
3. **Verification:** System validates account credentials and marks channels as `Active Target`.

## Journey 2: Content Creation, AI Drafting, and Live Preview
1. **Navigate to `/create-post`:** Select target channels (e.g., Telegram Channel + Instagram Feed).
2. **AI Caption Assistant:** Click "AI Yordamchi", select Tone ("Professional", "Viral", "Enthusiastic"), enter a prompt (e.g., "Grand opening announcement"), and receive platform-tailored text with hashtags.
3. **Media Upload:** Add image or video URLs (or choose from Media Library).
4. **Interactive Device Previews:**
   - **Instagram Preview:** Displays realistic smartphone view with avatar, photo/video, like/comment counts, and formatted caption.
   - **Telegram Preview:** Displays Telegram desktop/mobile bubble with formatted HTML, time, and view counts.
   - **YouTube Preview:** Displays video player frame with title, description snippet, and privacy status.
5. **Publish Action:**
   - **Publish Now:** Triggers `PublicationExecutionEngine` immediately.
   - **Schedule Post:** Select future date and time for background execution.

## Journey 3: Monitoring, Verification & Error Remediation
1. **View Delivery in `/published`:**
   - Status indicators: `PUBLISHED`, `SCHEDULED`, `FAILED`.
   - For `PUBLISHED`: Click "Jonli post / Open Post" to inspect the live post on Instagram (`https://instagram.com/p/...`) or Telegram (`https://t.me/...`).
   - For `FAILED`: Clear error message displayed (e.g., "Bot was blocked by the channel"). One-click "Qayta urinish (Retry)" button automatically retries the job.
