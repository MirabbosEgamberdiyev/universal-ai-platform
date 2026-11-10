# Production Environment Variables Reference
**Project Location:** `D:\My-project\universal-ai-platform`  
**Security Classification:** Highly Confidential  
**Standard:** Enterprise Zero-Mock Standard

---

## 1. Mandatory Core Variables (Fail-Fast)

| Variable Name | Required | Default / Format | Description |
| :--- | :--- | :--- | :--- |
| `SERVER_PORT` | Yes | `8090` | Spring Boot HTTP port |
| `SPRING_DATASOURCE_URL` | Yes | `jdbc:postgresql://localhost:5433/omniagent_dev` | PostgreSQL JDBC connection string |
| `SPRING_DATASOURCE_USERNAME` | Yes | `platform_admin` | PostgreSQL admin username |
| `SPRING_DATASOURCE_PASSWORD` | Yes | `[SECURE_PASSWORD]` | PostgreSQL admin password |
| `SPRING_DATA_REDIS_HOST` | Yes | `127.0.0.1` | Redis host |
| `SPRING_DATA_REDIS_PORT` | Yes | `6389` | Redis port |
| `SPRING_DATA_REDIS_PASSWORD` | Yes | `[SECURE_REDIS_PASS]` | Redis auth password |
| `SPRING_RABBITMQ_HOST` | Yes | `127.0.0.1` | RabbitMQ broker host |
| `SPRING_RABBITMQ_PORT` | Yes | `5672` | RabbitMQ AMQP port |
| `SPRING_RABBITMQ_USERNAME` | Yes | `platform_mq` | RabbitMQ username |
| `SPRING_RABBITMQ_PASSWORD` | Yes | `[SECURE_RABBIT_PASS]` | RabbitMQ password |

---

## 2. Cryptographic Key Management (AES-256-GCM Vault)

| Variable Name | Required | Example Format | Purpose |
| :--- | :--- | :--- | :--- |
| `JWT_SECRET` | Yes | 64-char Hex (256 bits) | Secret used to sign user JWT access and refresh tokens |
| `OMNIAGENT_KMS_MASTER_KEY` | Yes | 32-byte Base64 or Passphrase | Master encryption key for the AES-256-GCM Token Vault |
| `OMNIAGENT_KMS_ACTIVE_KEY_ID` | Yes | `kms-v1` | Identifier for active encryption key version in database |

---

## 3. Optional Social & AI Provider Variables

| Variable Name | Required | Description | Fallback Behavior if Absent |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Optional | Google Gemini Generative AI API key | Returns `AI_PROVIDER_NOT_CONFIGURED` on request |
| `OPENAI_API_KEY` | Optional | OpenAI API key for GPT-4o synthesis | Returns `AI_PROVIDER_NOT_CONFIGURED` on request |
| `TELEGRAM_BOT_TOKEN` | Per-Account | User Telegram bot token from `@BotFather` | Configured per account via `/accounts` UI |
| `META_PAGE_ACCESS_TOKEN` | Per-Account | Meta Graph API Page/IG Access Token | Configured per account via `/accounts` UI |
| `GOOGLE_OAUTH_TOKEN` | Per-Account | Google OAuth 2.0 Token (`youtube.upload`) | Configured per account via `/accounts` UI |
