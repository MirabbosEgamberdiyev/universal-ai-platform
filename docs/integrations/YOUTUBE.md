# YouTube Data API v3 Integration

## 1. Overview
The platform allows creators to upload videos and YouTube Shorts using Google OAuth 2.0 and the YouTube Data API v3.

## 2. Authorization Scopes
- `https://www.googleapis.com/auth/youtube.upload`
- `https://www.googleapis.com/auth/youtube.readonly`

## 3. Video Upload Flow
1. **Resumable Upload Session Initiation:**
   - `POST https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`
   - Headers: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json; charset=UTF-8`
   - Request Body:
     ```json
     {
       "snippet": {
         "title": "Post Title",
         "description": "Post Caption & Description",
         "tags": ["social", "growth"],
         "categoryId": "22"
       },
       "status": {
         "privacyStatus": "public"
       }
     }
     ```
2. **Binary Video Transfer:**
   - Stream video chunk via `PUT <Upload-URL>`
3. **Response & Direct Video Link:**
   - Returns video ID (`videoId`).
   - Direct link: `https://www.youtube.com/watch?v={videoId}` or `https://youtube.com/shorts/{videoId}`.
