# Production Rollback Plan & Incident Management
**Project Location:** `D:\My-project\universal-ai-platform`  
**Application:** NovaSphere AI Social Media Platform

---

## 1. Rollback Trigger Criteria
A rollback must be initiated immediately if any of the following occur during or post-deployment:
1. Actuator health endpoint `http://localhost:8090/actuator/health` reports `DOWN` for > 60 seconds.
2. HTTP 5xx error rate on publishing endpoints exceeds 1.0% over a 5-minute window.
3. Cryptographic Token Vault self-test fails on application startup (`verifyVaultIntegrity`).
4. Database migration deadlock or unhandled schema error.

---

## 2. Fast Rollback Procedure (Zero Downtime)

### Step 1: Re-point Reverse Proxy Traffic
Switch Nginx upstream from the new release candidate port back to the previously stable blue/green port:
```nginx
upstream backend_cluster {
    server 127.0.0.1:8091; # Previous stable release
    # server 127.0.0.1:8090; # Current faulty release (commented out)
}
```
Reload Nginx:
```bash
nginx -s reload
```

### Step 2: Stop Faulty Backend Daemon
```powershell
Stop-Process -Id <PID> -Force
```

### Step 3: Database Schema Rollback (If Migration Involved)
If the new release introduced a faulty Flyway migration:
1. Identify the previous schema version:
   ```bash
   docker exec -t ai_platform_postgres psql -U platform_admin -d omniagent_dev -c "SELECT version, installed_on FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 3;"
   ```
2. Execute the corresponding undo migration or restore from the pre-deployment database snapshot.

### Step 4: Frontend Rollback
Revert Next.js to the previously tagged release build:
```bash
cd D:/My-project/universal-ai-platform/frontend
git checkout tags/v1.0.0-stable
npm run build
npx next start -p 3005
```

### Step 5: Post-Rollback Health Check
Validate endpoints:
- `http://localhost:8090/actuator/health` -> `UP`
- `http://localhost:3005/dashboard` -> HTTP 200
