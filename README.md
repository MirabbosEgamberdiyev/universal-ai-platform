# OmniAgent / NovaSphere AI
## Universal AI Personal Assistant & Autonomous Operations Platform

[![Java](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-blue.svg)](https://www.postgresql.org/)
[![Security](https://img.shields.io/badge/Security-AES--256--GCM%20Token%20Vault-red.svg)](docs/security/security-model.md)
[![License](https://img.shields.io/badge/License-Proprietary-lightgrey.svg)]()

> **OmniAgent (NovaSphere AI)** is an enterprise-grade, multi-tenant digital assistant and social media operations platform. Unlike conventional scheduling utilities, OmniAgent provides an intelligent, autonomous agent copilot capable of natural language understanding, cross-platform publication, omnichannel customer messaging, workflow automation, and CRM management across Instagram, Facebook, Telegram, LinkedIn, TikTok, YouTube, and X.

---

## 🌟 Key Platform Capabilities

1. **4-Level Autonomy Spectrum with Mode 3 Default**:
   - **Mode 1: Advisor** — Read-only auditing, performance analytics, and proactive strategy recommendations.
   - **Mode 2: Creator** — AI drafting of multilingual captions, hashtags, and media assets.
   - **Mode 3: Operator (Human-in-the-Loop)** — **Default operational mode**. The agent autonomously plans multi-step tasks, creates draft payloads, and gates all external publications or irreversible mutations behind an operator approval center.
   - **Mode 4: Autopilot** — Autonomous task execution within strictly bounded daily budgets and safety thresholds.

2. **Hardware-Backed AES-256-GCM Token Vault**:
   - Zero plain-text token exposure.
   - All OAuth access tokens, refresh tokens, and Telegram bot secrets are envelope-encrypted at rest with key-version identifiers and rotation support.

3. **Strict Official API Compliance**:
   - Meta Graph API v19.0 (Instagram Professional containers + Facebook Pages).
   - Telegram Bot API v7.x (MTProto userbots strictly prohibited).
   - LinkedIn Community Management API (OAuth 2.0 PKCE).
   - No fragile browser automation, no unauthorized web scraping, no risk of platform bans.

4. **Multi-Model AI Brain with Fallback Routing**:
   - Primary LLM: **Google Gemini 1.5 Pro / Flash**.
   - Deterministic Fallback: **OpenAI GPT-4o / GPT-4o-mini**.
   - Built-in Prompt Injection Firewall and Content Moderation filters.

5. **True 4-Language Localization**:
   - Native UI, system prompts, and content generation in **Uzbek Latin (`uz-Latn`)**, **Uzbek Cyrillic (`uz-Cyrl`)**, **Russian (`ru`)**, and **English (`en`)**.

6. **Verified Publication State Machine**:
   - Zero hallucinated successes. A publication job only transitions to `PUBLISHED` when the external platform API returns a confirmed external entity identifier (e.g., Telegram message ID or Instagram media ID).

---

## 🏗️ System Architecture

OmniAgent is engineered as a **Modular Monolith** following **Hexagonal Architecture (Ports & Adapters)** and utilizing **Java 21 Virtual Threads (`Project Loom`)** for high-throughput, non-blocking I/O operations without thread pool starvation.

```
[ Frontend: Next.js 14 App Router (TypeScript + Tailwind) ]
                           │  HTTP / REST / WebSocket
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Spring Boot 3.3.4 Application Core (Virtual Threads)     │
│                                                         │
│  [Security & IAM]   [Agent Orchestrator] [Token Vault]  │
│  [Content Studio]   [Scheduler Engine]   [Unified Inbox]│
│  [CRM & Pipelines]  [Workflows & DAG]    [Audit Log]    │
│                                                         │
│  Ports & Adapters:                                      │
│  ├─ Telegram Bot API Adapter                            │
│  ├─ Meta Graph API Adapter (IG/FB)                      │
│  ├─ Google Gemini & OpenAI LLM Providers                │
│  └─ S3/MinIO Media Storage Adapter                      │
└────────┬────────────────────┬────────────────────┬──────┘
         ▼                    ▼                    ▼
[ PostgreSQL 16 RLS ]    [ Redis 7 ]       [ RabbitMQ 3.13 ]
```

---

## 🚀 Quick Start with Docker Compose

The easiest way to run the full production environment (Database, Redis, RabbitMQ, Backend, and Frontend) is via Docker Compose or the provided one-click scripts:

### Windows One-Click:
- Double click **`docker-start.bat`** to start all services in Docker.
- Double click **`docker-stop.bat`** to stop all services.
- Double click **`docker-logs.bat`** to view real-time logs.

### Command Line:
```bash
# 1. Spin up all services in Docker
docker compose up -d

# 2. View logs
docker compose logs -f
```

Services will be accessible at:
- **Frontend Web UI:** `http://localhost:3005`
- **Backend REST API:** `http://localhost:8090/api/v1`
- **Swagger OpenAPI Docs:** `http://localhost:8090/swagger-ui/index.html`
- **RabbitMQ Management:** `http://localhost:15674` (User: `platform_mq`, Pass: `RabbitSecurePass123!`)
- **Default Admin Account:** Username: `Admin` (or `admin@novasphere.ai`) / Password: `Admin.123$`

---

## 💻 Local Development Setup

### Prerequisites
- **Java 21 LTS** (JDK 21+)
- **Apache Maven 3.9+**
- **Node.js 20+** and **npm 10+**
- **PostgreSQL 16+** service running on port 5432
- **Redis 7+** service running on port 6379

### 1. Backend Setup

```bash
cd universal-ai-platform/backend

# Verify test suite
mvn test

# Run Spring Boot service locally
mvn spring-boot:run
```
The backend initializes database tables via Flyway migrations located at `src/main/resources/db/migration/V1__initial_schema.sql`.

### 2. Frontend Setup

```bash
cd universal-ai-platform/frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Testing & Verification

### Backend Tests
Execute unit and integration tests across core domain services, encryption vaults, and AI orchestrators:
```bash
cd universal-ai-platform/backend
mvn test
```

### Frontend Build & Type Validation
Verify strict TypeScript compilation and production bundle generation:
```bash
cd universal-ai-platform/frontend
npm run build
```

---

## 📚 Architectural Documentation

All architectural decisions, capability matrices, and competitor audits are preserved in the root `docs/` repository:

- [System Architecture](file:///D:/My-project/docs/architecture/system-architecture.md)
- [Database Schema Design & RLS](file:///D:/My-project/docs/database/schema-design.md)
- [Zero-Trust Security & Token Vault](file:///D:/My-project/docs/security/security-model.md)
- [Platform Capability Matrix](file:///D:/My-project/docs/integrations/platform-capability-matrix.md)
- [UI/UX Design Specification](file:///D:/My-project/docs/ui-ux/ui-ux-specification.md)
- [API Architecture & Endpoints](file:///D:/My-project/docs/api/api-architecture.md)
- [Product Roadmap & Stages](file:///D:/My-project/docs/PRODUCT_ROADMAP.md)

---

## 📄 License & Compliance

OmniAgent is proprietary software designed for enterprise multi-tenant deployment. All rights reserved.
All third-party social media integrations operate under their respective Developer Terms of Service and official API policies.
