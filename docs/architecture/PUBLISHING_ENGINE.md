# Publishing Execution Engine

## 1. Responsibilities
`PublicationExecutionEngine` manages the reliable, fault-isolated dispatch of social media posts across heterogenous networks.

## 2. Key Execution Flow
```
User -> POST /quick-publish
            |
            v
PublicationSchedulerService creates Content, ContentAssets, & PublicationJobs
            |
            v
PublicationExecutionEngine.executeJob(job)
            |
  +---------+---------+---------+
  |                   |         |
  v                   v         v
TelegramAdapter   MetaAdapter YouTubeAdapter
  |                   |         |
  v                   v         v
Result: SUCCESS     Result: FAILED (Rate-limit)
Status: PUBLISHED   Status: FAILED (With Error Message)
Live Link Generated Retriable via POST /retry/{jobId}
```

## 3. Resilience Guarantees
- **Channel Isolation:** A failure in one channel (e.g. YouTube quota exceeded) never cancels or rolls back successful publications in other channels (e.g. Telegram or Instagram).
- **Idempotency:** Unique `externalChannelId` and `jobId` prevent duplicate posts.
- **Audit Logging:** Every attempt, token decryption, request payload, response status code, and network error is recorded in `publication_job_audit`.
