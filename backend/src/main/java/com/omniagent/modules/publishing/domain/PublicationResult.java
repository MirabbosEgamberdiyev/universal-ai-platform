package com.omniagent.modules.publishing.domain;

import com.omniagent.common.domain.BaseEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "publication_results")
public class PublicationResult extends BaseEntity {

    @Column(name = "publication_job_id", nullable = false)
    private UUID publicationJobId;

    @Column(name = "platform_post_id", nullable = false)
    private String platformPostId; // Verified Platform Receipt

    @Column(name = "post_url")
    private String postUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_response", columnDefinition = "jsonb")
    private String rawResponse;

    @Column(name = "published_at", nullable = false)
    private Instant publishedAt = Instant.now();

    public UUID getPublicationJobId() {
        return publicationJobId;
    }

    public void setPublicationJobId(UUID publicationJobId) {
        this.publicationJobId = publicationJobId;
    }

    public String getPlatformPostId() {
        return platformPostId;
    }

    public void setPlatformPostId(String platformPostId) {
        this.platformPostId = platformPostId;
    }

    public String getPostUrl() {
        return postUrl;
    }

    public void setPostUrl(String postUrl) {
        this.postUrl = postUrl;
    }

    public String getRawResponse() {
        return rawResponse;
    }

    public void setRawResponse(String rawResponse) {
        this.rawResponse = rawResponse;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(Instant publishedAt) {
        this.publishedAt = publishedAt;
    }
}
