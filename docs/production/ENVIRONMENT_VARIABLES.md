# Environment Variables Specification

## 1. Core Server & Database Configuration
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `SERVER_PORT` | `8090` | Spring Boot HTTP server port |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5433/omniagent_dev` | PostgreSQL JDBC connection URL |
| `SPRING_DATASOURCE_USERNAME` | `platform_admin` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | `PlatformSecurePass123!` | Database password |
| `SPRING_DATA_REDIS_HOST` | `127.0.0.1` | Redis host |
| `SPRING_DATA_REDIS_PORT` | `6389` | Redis port |
| `SPRING_DATA_REDIS_PASSWORD` | `RedisSecurePass123!` | Redis auth password |
| `SPRING_RABBITMQ_HOST` | `127.0.0.1` | RabbitMQ broker host |
| `SPRING_RABBITMQ_PORT` | `5672` | RabbitMQ AMQP port |
| `SPRING_RABBITMQ_USERNAME` | `platform_mq` | RabbitMQ username |
| `SPRING_RABBITMQ_PASSWORD` | `RabbitSecurePass123!` | RabbitMQ password |

## 2. Cryptographic Security & Vault Keys
| Variable | Example / Recommendation | Description |
| :--- | :--- | :--- |
| `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | 256-bit Hex secret for HMAC-SHA256 JWT signing |
| `OMNIAGENT_KMS_MASTER_KEY` | `OmniAgentKmsKey2026SecureVault!` | 256-bit AES master encryption key for Token Vault |
| `OMNIAGENT_KMS_ACTIVE_KEY_ID` | `kms-v1` | Identifier for active encryption key version |

## 3. Frontend Next.js Configuration (`frontend/.env.local`)
| Variable | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8090/api/v1` | Backend REST endpoint for client fetches |
| `PORT` | `3005` | Next.js server port |
