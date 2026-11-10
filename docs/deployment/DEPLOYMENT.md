# Production Deployment Architecture & Runbook
**Project Location:** `D:\My-project\universal-ai-platform`  
**Standard:** Enterprise Zero-Mock Production Standard  
**Release:** v1.0.0-PROD  
**Date:** 2026-11-10

---

## 1. Production Architecture Overview
The platform operates as an enterprise Modular Monolith running on Java 21 with Project Loom Virtual Threads, backed by PostgreSQL 16 (relational persistence), Redis 7 (scheduling ZSET & rate limiting), RabbitMQ 3.13 (asynchronous messaging), and a Next.js 14 App Router frontend.

```
                          +------------------------------------------+
                          |   Nginx Reverse Proxy / Cloudflare CDN   |
                          |      TLS 1.3 Termination (Port 443)      |
                          +------------------------------------------+
                                       /                     \
                   /api/v1/*          /                       \   Static & SSR
                                     v                         v
       +------------------------------------+    +------------------------------------+
       |   Backend Spring Boot 3.3.4 (8090) |    |     Frontend Next.js 14 (3005)     |
       |     Java 21 Virtual Threads        |    |     44 Routes, 87.1 kB JS Bundle   |
       +------------------------------------+    +------------------------------------+
              |               |               |
              v               v               v
       +--------------+ +-----------+ +---------------+
       | PostgreSQL 16| |  Redis 7  | | RabbitMQ 3.13 |
       | (Port 5433)  | |(Port 6389)| |  (Port 5672)  |
       +--------------+ +-----------+ +---------------+
```

---

## 2. Infrastructure Prerequisites
- **OS:** Linux (Ubuntu 22.04 LTS / Debian 12) or Windows Server 2022
- **JDK:** OpenJDK 21.0.1+ (LTS, 64-bit)
- **Node.js:** Node.js 18.x or 20.x LTS with npm 10+
- **Database:** PostgreSQL 16 with `pgcrypto` extension
- **In-Memory Store:** Redis 7.2 with AOF (Append-Only File) persistence enabled
- **Message Broker:** RabbitMQ 3.13 with management plugin enabled

---

## 3. Step-by-Step Deployment Procedure

### Step 3.1: Start Backing Services
```bash
cd D:/My-project/universal-ai-platform/docker
docker compose up -d
```
Verify container health:
- `docker ps --filter "name=ai_platform"`

### Step 3.2: Build and Package Backend
```bash
cd D:/My-project/universal-ai-platform/backend
mvn clean package -DskipTests
```
Artifact generated: `target/omniagent-backend-1.0.0-SNAPSHOT.jar`

### Step 3.3: Launch Backend Process
```bash
export SERVER_PORT=8090
export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5433/omniagent_dev"
export SPRING_DATASOURCE_USERNAME="platform_admin"
export SPRING_DATASOURCE_PASSWORD="PlatformSecurePass123!"
export SPRING_DATA_REDIS_HOST="127.0.0.1"
export SPRING_DATA_REDIS_PORT=6389
export SPRING_DATA_REDIS_PASSWORD="RedisSecurePass123!"
export SPRING_RABBITMQ_HOST="127.0.0.1"
export SPRING_RABBITMQ_PORT=5672
export SPRING_RABBITMQ_USERNAME="platform_mq"
export SPRING_RABBITMQ_PASSWORD="RabbitSecurePass123!"
export JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
export OMNIAGENT_KMS_MASTER_KEY="OmniAgentKmsKey2026SecureVault!"
export OMNIAGENT_KMS_ACTIVE_KEY_ID="kms-v1"

java -jar target/omniagent-backend-1.0.0-SNAPSHOT.jar
```

### Step 3.4: Build and Launch Frontend
```bash
cd D:/My-project/universal-ai-platform/frontend
npm install
npm run build
npx next start -p 3005
```

### Step 3.5: Health & Readiness Verification
- Health: `curl -s http://localhost:8090/actuator/health` -> `{"status":"UP"}`
- Frontend: `curl -I http://localhost:3005` -> `HTTP/1.1 200 OK`
