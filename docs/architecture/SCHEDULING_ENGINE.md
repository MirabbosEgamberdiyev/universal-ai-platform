# Scheduling Engine Architecture

## 1. Dual-Tier Scheduling Architecture
The scheduling engine uses a hybrid architecture combining Redis Sorted Sets for sub-minute precision dispatch with database durability in PostgreSQL.

1. **Redis ZSET Dispatcher:**
   - Keys: `publishing:scheduled_jobs:zset`
   - Score: Epoch millisecond of `scheduledFor`.
   - Member: `jobId`.
2. **Spring `@Scheduled` Poller:**
   - Runs every 30 seconds (`cron = "*/30 * * * * *"`) to poll due jobs (`scheduledFor <= Instant.now() AND status = 'SCHEDULED'`).
   - Virtual threads process each batch concurrently without blocking the poller thread.
3. **Calendar Feed API:**
   - `GET /api/v1/publications/calendar?start=...&end=...`
   - Returns aggregated posts for calendar visualization in `/calendar`.
