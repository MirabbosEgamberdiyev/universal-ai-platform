# NovaSphere AI — Route Inventory & Navigation Audit
**Platform:** NovaSphere AI  
**Location:** `D:\My-project\universal-ai-platform`  
**Date:** 2026-11-10  

---

## 1. Core Social Media Management Routes (Active Navigation)

| Route | Page Title (uzl) | Access Level | Purpose | Health Status |
| :--- | :--- | :--- | :--- | :--- |
| `/dashboard` | Boshqaruv paneli | Authenticated | Operational dashboard: KPI metrics, queue, recent publications, quick CTAs | `VERIFIED 200 OK` |
| `/create-post` | Post yaratish | Authenticated | Multi-channel composer: text, media URLs, channel selection, live previews | `VERIFIED 200 OK` |
| `/calendar` | Nashrlar taqvimi | Authenticated | Interactive calendar: visual schedule, time slots, scheduled posts by network | `VERIFIED 200 OK` |
| `/accounts` | Ijtimoiy tarmoqlar | Authenticated | Channel connections: Instagram Graph API, Telegram Bot, YouTube Data API | `VERIFIED 200 OK` |
| `/media` | Media kutubxona | Authenticated | Binary asset management: magic byte validation, uploads, preview, storage meter | `VERIFIED 200 OK` |
| `/published` | Chiqarilgan postlar | Authenticated | Publication history, delivery receipts, live URLs, error diagnostics, retry | `VERIFIED 200 OK` |
| `/analytics` | Tahlil va Statistika | Authenticated | Real source-backed metrics: audience reach, publication counts, channel growth | `VERIFIED 200 OK` |
| `/assistant` | AI Yordamchi | Authenticated | Conversational copilot: caption generator, hashtag finder, tone adjuster | `VERIFIED 200 OK` |
| `/notifications`| Bildirishnomalar | Authenticated | Real-time alerts: publication results, token expiration warnings, system alerts | `VERIFIED 200 OK` |
| `/settings` | Sozlamalar | Authenticated | Organization settings, user profile, security tokens, API keys, preferences | `VERIFIED 200 OK` |

---

## 2. Public & Authentication Routes

| Route | Page Title | Access Level | Purpose | Health Status |
| :--- | :--- | :--- | :--- | :--- |
| `/` | NovaSphere AI | Public | Product landing page: social management features, demo, hero CTA | `VERIFIED 200 OK` |
| `/login` | Tizimga kirish | Public | User authentication: JWT credentials, remember me, error alerts | `VERIFIED 200 OK` |
| `/register` | Ro'yxatdan o'tish | Public | Tenant onboarding: organization name, email, strong password | `VERIFIED 200 OK` |
| `/forgot-password` | Parolni tiklash | Public | Password recovery flow | `VERIFIED 200 OK` |
| `/reset-password` | Yangi parol | Public | Token-based password reset | `VERIFIED 200 OK` |
| `/verify-email` | Emailni tasdiqlash | Public | Account activation verification | `VERIFIED 200 OK` |

---

## 3. Legacy Enterprise Routes (Archived from Active Sidebar)

The following secondary routes were identified from earlier enterprise audits and remain available in the codebase without polluting the primary 10-item Social Media navigation:
- `/admin`, `/agents`, `/approvals`, `/audit-logs`, `/billing`, `/business`, `/crm`, `/documents`, `/email`, `/executions`, `/inbox`, `/integrations`, `/knowledge`, `/meetings`, `/onboarding`, `/productivity`, `/profile`, `/security`, `/studio`, `/tasks`, `/team`, `/usage`, `/workflows`.
