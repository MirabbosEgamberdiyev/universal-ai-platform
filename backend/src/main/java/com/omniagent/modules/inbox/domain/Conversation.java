package com.omniagent.modules.inbox.domain;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "conversations")
public class Conversation extends TenantEntity {

    @Column(name = "channel_id", nullable = false)
    private UUID channelId;

    @Column(name = "external_sender_id", nullable = false)
    private String externalSenderId;

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "sender_handle")
    private String senderHandle;

    @Column(name = "sentiment")
    private String sentiment = "NEUTRAL"; // POSITIVE, NEUTRAL, NEGATIVE

    @Column(name = "priority")
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

    @Column(name = "assigned_user_id")
    private UUID assignedUserId;

    @Column(name = "status", nullable = false)
    private String status = "OPEN"; // OPEN, SNOOZED, RESOLVED, BLOCKED

    @Column(name = "last_message_at", nullable = false)
    private Instant lastMessageAt = Instant.now();

    @Column(name = "messaging_window_expires_at")
    private Instant messagingWindowExpiresAt; // Meta 24-hr rule

    public UUID getChannelId() {
        return channelId;
    }

    public void setChannelId(UUID channelId) {
        this.channelId = channelId;
    }

    public String getExternalSenderId() {
        return externalSenderId;
    }

    public void setExternalSenderId(String externalSenderId) {
        this.externalSenderId = externalSenderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderHandle() {
        return senderHandle;
    }

    public void setSenderHandle(String senderHandle) {
        this.senderHandle = senderHandle;
    }

    public String getSentiment() {
        return sentiment;
    }

    public void setSentiment(String sentiment) {
        this.sentiment = sentiment;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public UUID getAssignedUserId() {
        return assignedUserId;
    }

    public void setAssignedUserId(UUID assignedUserId) {
        this.assignedUserId = assignedUserId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(Instant lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public Instant getMessagingWindowExpiresAt() {
        return messagingWindowExpiresAt;
    }

    public void setMessagingWindowExpiresAt(Instant messagingWindowExpiresAt) {
        this.messagingWindowExpiresAt = messagingWindowExpiresAt;
    }
}
