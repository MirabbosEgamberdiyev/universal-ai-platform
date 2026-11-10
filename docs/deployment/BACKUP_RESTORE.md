# Backup and Disaster Recovery Procedure
**Project Location:** `D:\My-project\universal-ai-platform`  
**Database:** PostgreSQL 16 (`omniagent_dev` on port 5433)  
**Vault:** AES-256-GCM Master Key Escrow

---

## 1. Automated PostgreSQL Backup (Daily pg_dump)
Run daily scheduled backup via cron or Windows Task Scheduler:
```bash
docker exec -t ai_platform_postgres pg_dump -U platform_admin -d omniagent_dev --format=custom --blobs --verbose | gzip > /backups/postgres/omniagent_$(date +%Y%m%d_%H%M%S).dump.gz
```

### Retention Policy:
- Hourly snapshots: Retained for 48 hours.
- Daily snapshots: Retained for 30 days.
- Weekly cold archives: Retained for 12 months in immutable object storage.

---

## 2. Disaster Recovery & Database Restoration
In case of server failure or database corruption:
1. **Stop Application Backend:**
   - Stop backend daemon on port 8090 to prevent concurrent writes.
2. **Re-create Clean Database:**
   ```bash
   docker exec -i ai_platform_postgres dropdb -U platform_admin omniagent_dev
   docker exec -i ai_platform_postgres createdb -U platform_admin omniagent_dev
   ```
3. **Restore from Snapshot:**
   ```bash
   gunzip -c /backups/postgres/omniagent_20261110_120000.dump.gz | docker exec -i ai_platform_postgres pg_restore -U platform_admin -d omniagent_dev -v
   ```
4. **Validate Schema & Flyway:**
   ```bash
   docker exec -t ai_platform_postgres psql -U platform_admin -d omniagent_dev -c "SELECT version, description, success FROM flyway_schema_history;"
   ```
5. **Restart Backend:**
   - Start backend daemon on port 8090.

---

## 3. Cryptographic Token Vault Key Escrow
The master KMS key (`OMNIAGENT_KMS_MASTER_KEY`) must be escrowed in an enterprise Key Management Service (AWS KMS, Google Cloud KMS, or HashiCorp Vault). 

> [!CAUTION]
> Restoring a database backup on a server without the matching `OMNIAGENT_KMS_MASTER_KEY` will result in cryptographic decryption failures whenever the publishing engine attempts to decrypt social API tokens.
