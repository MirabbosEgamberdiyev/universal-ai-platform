# Social Platform Architecture

## 1. Architectural Style: Modular Monolith with Virtual Threads
NovaSphere AI backend is constructed as a Spring Boot 3.3.4 Modular Monolith running on Java 21 with Project Loom Virtual Threads enabled (`spring.threads.virtual.enabled=true`).

```
                +---------------------------------------+
                |     Next.js 14 Frontend (Port 3005)   |
                +---------------------------------------+
                                    | REST (JSON)
                                    v
+-----------------------------------------------------------------------+
|                 NovaSphere Core Backend (Port 8090)                   |
|                                                                       |
|  +--------------------+  +--------------------+  +-----------------+  |
|  | SocialAccountModule|  |  PublishingModule  |  |  ContentModule  |  |
|  +--------------------+  +--------------------+  +-----------------+  |
|            |                        |                     |           |
|            v                        v                     v           |
|  +--------------------+  +--------------------+  +-----------------+  |
|  |  TokenVaultService |  |  ExecutionEngine   |  | MediaRepository |  |
|  |  (AES-256-GCM)     |  | (Resilient Adapters|  +-----------------+  |
|  +--------------------+  +--------------------+                       |
+-----------------------------------------------------------------------+
         |                        |                     |
         v                        v                     v
+-----------------+      +-----------------+   +------------------+
|  PostgreSQL 16  |      |     Redis 7     |   |   RabbitMQ 3.13  |
|   (Port 5433)   |      |   (Port 6389)   |   |   (Port 5672)    |
+-----------------+      +-----------------+   +------------------+
```

## 2. Hexagonal Adapters Pattern
All external social networks are isolated behind the `SocialPlatformAdapter` interface:
```java
public interface SocialPlatformAdapter {
    String getPlatform();
    PublishResult publish(PublishContext context);
    List<DiscoveredChannel> fetchChannels(String accessToken);
    AccountHealthStatus checkHealth(String credentials);
}
```

Implementations:
- `MetaAdapter`: Communicates with Meta Graph API v19.0.
- `TelegramAdapter`: Communicates with Telegram Bot API (`https://api.telegram.org/bot<TOKEN>/`).
- `YouTubeAdapter`: Communicates with Google / YouTube Data API v3 (`https://www.googleapis.com/upload/youtube/v3/videos`).
- `TikTokAdapter`: Returns `BLOCKED_BY_EXTERNAL_APPROVAL`.
- `LinkedInAdapter`: Returns `BLOCKED_BY_EXTERNAL_APPROVAL`.
