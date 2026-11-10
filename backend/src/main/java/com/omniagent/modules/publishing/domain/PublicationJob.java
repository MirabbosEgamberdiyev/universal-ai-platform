package com.omniagent.modules.publishing.domain;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "publication_jobs")
public class PublicationJob extends TenantEntity {

    @Column(name = "content_id", nullable = false)
    private UUID contentId;

    @Column(name = "channel_id", nullable = false)
    private UUID channelId;

    @Column(name = "scheduled_for", nullable = false)
    private Instant scheduledFor;

    @Column(name = "status", nullable = false)
    private String status = "SCHEDULED"; // SCHEDULED, PROCESSING, PUBLISHED, FAILED, RETRYING

    @Column(name = "idempotency_key", nullable = false, unique = true)
    private UUID idempotencyKey = UUID.randomUUID();

    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;

    @Column(name = "max_retries", nullable = false)
    private Integer maxRetries = 3;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "source_timezone")
    private String sourceTimezone = "UTC";

    public String getSourceTimezone() {
        return sourceTimezone;
    }

    public void setSourceTimezone(String sourceTimezone) {
        this.sourceTimezone = sourceTimezone;
    }

    public UUID getContentId() {
        return contentId;
    }

    public void setContentId(UUID contentId) {
        this.contentId = contentId;
    }

    public UUID getChannelId() {
        return channelId;
    }

    public void setChannelId(UUID channelId) {
        this.channelId = channelId;
    }

    public Instant getScheduledFor() {
        return scheduledFor;
    }

    public void setScheduledFor(Instant scheduledFor) {
        this.scheduledFor = scheduledFor;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public UUID getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(UUID idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public Integer getMaxRetries() {
        return maxRetries;
    }

    public void setMaxRetries(Integer maxRetries) {
        this.maxRetries = maxRetries;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
