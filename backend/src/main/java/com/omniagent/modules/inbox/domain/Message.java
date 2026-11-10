package com.omniagent.modules.inbox.domain;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "messages")
public class Message extends TenantEntity {

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Column(name = "direction", nullable = false)
    private String direction; // INBOUND, OUTBOUND

    @Column(name = "external_message_id")
    private String externalMessageId;

    @Column(name = "content_text", columnDefinition = "TEXT")
    private String contentText;

    @Column(name = "media_url")
    private String mediaUrl;

    @Column(name = "ai_generated", nullable = false)
    private Boolean aiGenerated = false;

    @Column(name = "approval_status")
    private String approvalStatus = "APPROVED"; // PENDING, APPROVED, REJECTED

    @Column(name = "sent_by_user_id")
    private UUID sentByUserId;

    public UUID getConversationId() {
        return conversationId;
    }

    public void setConversationId(UUID conversationId) {
        this.conversationId = conversationId;
    }

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }

    public String getExternalMessageId() {
        return externalMessageId;
    }

    public void setExternalMessageId(String externalMessageId) {
        this.externalMessageId = externalMessageId;
    }

    public String getContentText() {
        return contentText;
    }

    public void setContentText(String contentText) {
        this.contentText = contentText;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public Boolean getAiGenerated() {
        return aiGenerated;
    }

    public void setAiGenerated(Boolean aiGenerated) {
        this.aiGenerated = aiGenerated;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public UUID getSentByUserId() {
        return sentByUserId;
    }

    public void setSentByUserId(UUID sentByUserId) {
        this.sentByUserId = sentByUserId;
    }
}
