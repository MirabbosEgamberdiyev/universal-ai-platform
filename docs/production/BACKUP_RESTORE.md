# Database Backup and Disaster Recovery Procedure

## 1. Automated PostgreSQL Backups
Run daily pg_dump on port 5433:
```bash
docker exec -t ai_platform_postgres pg_dump -U platform_admin omniagent_dev | gzip > /backups/db/omniagent_$(date +%Y%m%d_%H%M%S).sql.gz
```

## 2. Disaster Recovery & Restoration
To restore a snapshot:
```bash
gunzip -c /backups/db/omniagent_20261110_000000.sql.gz | docker exec -i ai_platform_postgres psql -U platform_admin -d omniagent_dev
```

## 3. Token Vault Key Backup
The `OMNIAGENT_KMS_MASTER_KEY` must be securely escrowed in a hardware security module (HSM) or enterprise secret manager (e.g., AWS Secrets Manager, HashiCorp Vault). Database backups without the corresponding master key cannot decrypt social tokens.
