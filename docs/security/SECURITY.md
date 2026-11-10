# Security & Token Vault Architecture

## 1. Zero-Trust Token Vault (AES-256-GCM)
All third-party OAuth access tokens, refresh tokens, and Telegram bot API tokens are protected by `TokenVaultService`:
- **Cipher:** AES/GCM/NoPadding (256-bit key length).
- **Initialization Vector:** 12-byte secure random IV generated per token encryption.
- **Authentication Tag:** 128-bit authentication tag ensuring ciphertext integrity.
- **Key Versioning:** Support for key rotation with `keyId` stored alongside ciphertext.
- **Master Key Security:** Derived from `OMNIAGENT_KMS_MASTER_KEY` environment variable; never logged or serialized to database plaintext.

## 2. Multi-Tenant Isolation
- `TenantContext` extracts `organizationId` from authenticated JWT claims.
- Every database query in repositories enforces tenant boundary filtering (`WHERE organization_id = :orgId`).
- Cross-tenant data access attempts result in immediate HTTP 403 Forbidden.

## 3. OWASP Top 10 Protections
1. **Broken Access Control:** Role-Based Access Control (`OWNER`, `ADMIN`, `CREATOR`, `VIEWER`).
2. **Cryptographic Failures:** Strong TLS 1.3 in transit, AES-256-GCM at rest, BCrypt (work factor 12) for user passwords.
3. **Injection Defense:** JPA prepared statements for SQL; strict JSON serialization for external HTTP requests; HTML entity sanitization on post preview rendering.
4. **Rate Limiting:** In-memory & Redis Token Bucket rate-limiting on sensitive endpoints (`/auth/login`, `/quick-publish`).
