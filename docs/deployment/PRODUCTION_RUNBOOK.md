# Production Operations Runbook (SRE Guide)
**Project Location:** `D:\My-project\universal-ai-platform`  
**Audience:** Site Reliability Engineers, DevOps, System Administrators

---

## 1. Routine Service Management

| Operation | Command | Expected Output |
| :--- | :--- | :--- |
| **Check Backend Health** | `curl -s http://localhost:8090/actuator/health` | `{"status":"UP","components":{...}}` |
| **Check Prometheus Metrics**| `curl -s http://localhost:8090/actuator/prometheus` | JVM, thread, and HTTP metrics output |
| **Check Database Connections** | `docker exec -t ai_platform_postgres psql -U platform_admin -d omniagent_dev -c "SELECT count(*) FROM pg_stat_activity;"` | Current active connections (typically 5-15) |
| **Check Redis Memory** | `docker exec -t ai_platform_redis redis-cli -a RedisSecurePass123! info memory` | `used_memory_human` |
| **Check RabbitMQ Queues** | `docker exec -t ai_platform_rabbitmq rabbitmqctl list_queues` | Queue names and message depths |

---

## 2. Common Operational Incidents & Remediation

### Incident 1: Social Platform API 429 (Rate Limit Exceeded)
- **Symptom:** Publication jobs marked `RETRYING` with error `429 Too Many Requests`.
- **Root Cause:** Meta or Telegram per-account publishing rate limit reached.
- **Action:**
  1. Do NOT manually retry immediately. The platform's exponential backoff scheduler automatically delays the next attempt.
  2. If urgent, inspect `/published` page in the admin UI and reschedule for a non-peak hour.

### Incident 2: Expired OAuth Token
- **Symptom:** Job fails with error `401 Unauthorized` or `OAuthException: Error validating access token`.
- **Root Cause:** External user token revoked or expired (e.g. Meta 60-day token expiration).
- **Action:**
  1. Navigate to `/accounts`.
  2. Re-authorize the affected Instagram or YouTube channel.
  3. Navigate to `/published` and click "Qayta urinish (Retry)" on the failed post.

### Incident 3: RabbitMQ Connection Interrupted
- **Symptom:** Backend logs show `Attempting to connect to: [127.0.0.1:5672]`.
- **Root Cause:** RabbitMQ container stopped or port conflict.
- **Action:**
  1. Restart RabbitMQ container: `docker restart ai_platform_rabbitmq`.
  2. Spring AMQP `CachingConnectionFactory` automatically recovers the connection once the broker responds.
