# Instagram Graph API Integration

## 1. Overview
The platform publishes directly to Instagram Professional (Business and Creator) accounts using the official Meta Graph API v19.0.

## 2. API Endpoints Used
1. **Container Creation:**
   - Single Image: `POST https://graph.facebook.com/v19.0/{ig-user-id}/media?image_url={url}&caption={caption}`
   - Video / Reels: `POST https://graph.facebook.com/v19.0/{ig-user-id}/media?media_type=REELS&video_url={url}&caption={caption}`
   - Carousel: `POST https://graph.facebook.com/v19.0/{ig-user-id}/media?media_type=CAROUSEL&children={id1},{id2}`
2. **Container Status Polling:**
   - `GET https://graph.facebook.com/v19.0/{container-id}?fields=status_code`
3. **Container Publication:**
   - `POST https://graph.facebook.com/v19.0/{ig-user-id}/media_publish?creation_id={container-id}`

## 3. Direct Post URL Construction
Upon successful publication, the platform queries `{creation-id}?fields=permalink` or constructs `https://instagram.com/p/{shortcode}`.
