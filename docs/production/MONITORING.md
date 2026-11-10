# Monitoring and Observability Guide

## 1. Spring Boot Actuator Endpoints
- **Health Check:** `GET http://localhost:8090/actuator/health`
  - Validates PostgreSQL connection, Redis ping, RabbitMQ broker availability, and disk space.
- **Prometheus Metrics:** `GET http://localhost:8090/actuator/prometheus`
  - Key metrics: `http_server_requests_seconds`, `jvm_threads_live_threads`, `process_cpu_usage`, `publication_jobs_total`.

## 2. Publication Health & Error Telemetry
- Every failed publication job records:
  - `status = 'FAILED'`
  - `errorMessage`: Sanitized error response from platform API (e.g., Telegram 403 Forbidden or Instagram Graph error).
  - Telemetry counters increment `social_publish_failures{platform="INSTAGRAM|TELEGRAM|YOUTUBE"}`.

## 3. Log Aggregation
- Unified structured JSON logging via SLF4J / Logback.
- Mapped Diagnostic Context (MDC) records `tenantId`, `traceId`, and `jobId` across all publication threads.
