# Production Deployment Guide

## 1. System Requirements
- **OS:** Linux (Ubuntu 22.04 LTS / Debian 12) or Windows Server
- **Runtime:** OpenJDK 21 (LTS) with Virtual Threads support
- **Node.js:** Node.js 18.x or 20.x LTS
- **Containers:** Docker 24+ & Docker Compose v2

## 2. Infrastructure Setup (Docker Compose)
Start backing services:
```bash
cd D:/My-project/universal-ai-platform/docker
docker compose up -d
```
Verifies:
- PostgreSQL 16 on port 5433
- Redis 7.2 on port 6389
- RabbitMQ 3.13 on port 5672 (Management on 15672)

## 3. Backend Build & Startup
```bash
cd D:/My-project/universal-ai-platform/backend
mvn clean package -DskipTests
java -jar target/omniagent-backend-1.0.0-SNAPSHOT.jar
```

## 4. Frontend Build & Startup
```bash
cd D:/My-project/universal-ai-platform/frontend
npm install
npm run build
npx next start -p 3005
```

## 5. Reverse Proxy & Domain Routing (Nginx)
Configure Nginx to reverse proxy:
- `https://app.novasphere.ai` -> `http://127.0.0.1:3005`
- `https://api.novasphere.ai` -> `http://127.0.0.1:8090`
