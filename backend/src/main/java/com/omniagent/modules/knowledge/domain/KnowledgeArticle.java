package com.omniagent.modules.knowledge.domain;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "knowledge_articles")
public class KnowledgeArticle extends TenantEntity {

    @Column(name = "knowledge_base_id", nullable = false)
    private UUID knowledgeBaseId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "source_citation")
    private String sourceCitation;

    @Column(name = "tags")
    private String[] tags = new String[0];

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = true;

    public UUID getKnowledgeBaseId() {
        return knowledgeBaseId;
    }

    public void setKnowledgeBaseId(UUID knowledgeBaseId) {
        this.knowledgeBaseId = knowledgeBaseId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSourceCitation() {
        return sourceCitation;
    }

    public void setSourceCitation(String sourceCitation) {
        this.sourceCitation = sourceCitation;
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }

    public Boolean getVerified() {
        return isVerified;
    }

    public void setVerified(Boolean verified) {
        isVerified = verified;
    }
}
