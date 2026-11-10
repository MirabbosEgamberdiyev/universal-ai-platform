# TikTok Content Posting API Integration Status

## 1. Integration Status
**Status:** `BLOCKED_BY_EXTERNAL_APPROVAL`

## 2. Requirement Details
Direct video publishing to TikTok requires access to the TikTok Content Posting API:
1. **Developer Registration:** An organization account on `developers.tiktok.com`.
2. **App Audit & Commercial Review:** TikTok conducts a manual compliance review of apps requesting `video.upload` and `video.publish` permissions.
3. **Webhook Verification:** Real-time callback verification for post publishing completion.

## 3. Platform Preparedness
The backend adapter (`TikTokAdapter.java`) and frontend UI are fully architected. When commercial developer approval is granted, the adapter is activated by updating configuration without requiring architectural changes.
