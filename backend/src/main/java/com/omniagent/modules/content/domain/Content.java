package com.omniagent.modules.content.domain;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "content")
public class Content extends TenantEntity {

    @Column(name = "title")
    private String title;

    @Column(name = "body_text", nullable = false, columnDefinition = "TEXT")
    private String bodyText;

    @Column(name = "locale", nullable = false)
    private String locale = "en";

    @Column(name = "tags")
    private String[] tags = new String[0];

    @Column(name = "status", nullable = false)
    private String status = "DRAFT"; // DRAFT, PENDING_APPROVAL, SCHEDULED, PUBLISHED, FAILED

    @Column(name = "author_id")
    private UUID authorId;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBodyText() {
        return bodyText;
    }

    public void setBodyText(String bodyText) {
        this.bodyText = bodyText;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public UUID getAuthorId() {
        return authorId;
    }

    public void setAuthorId(UUID authorId) {
        this.authorId = authorId;
    }
}
