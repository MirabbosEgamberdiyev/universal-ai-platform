package com.omniagent.modules.email.domain;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "emails")
public class Email extends TenantEntity {

    @Column(name = "email_account_id", nullable = false)
    private UUID emailAccountId;

    @Column(name = "external_message_id")
    private String externalMessageId;

    @Column(name = "thread_id")
    private String threadId;

    @Column(name = "sender_email", nullable = false)
    private String senderEmail;

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "body_snippet", columnDefinition = "TEXT")
    private String bodySnippet;

    @Column(name = "body_html", columnDefinition = "TEXT")
    private String bodyHtml;

    @Column(name = "category", nullable = false)
    private String category = "GENERAL"; // URGENT, LEAD, SUPPORT, NEWSLETTER, GENERAL

    @Column(name = "direction", nullable = false)
    private String direction = "INBOUND"; // INBOUND, OUTBOUND

    @Column(name = "status", nullable = false)
    private String status = "UNREAD"; // UNREAD, READ, ARCHIVED, SPAM

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Column(name = "ai_draft_reply", columnDefinition = "TEXT")
    private String aiDraftReply;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt = Instant.now();

    public UUID getEmailAccountId() {
        return emailAccountId;
    }

    public void setEmailAccountId(UUID emailAccountId) {
        this.emailAccountId = emailAccountId;
    }

    public String getExternalMessageId() {
        return externalMessageId;
    }

    public void setExternalMessageId(String externalMessageId) {
        this.externalMessageId = externalMessageId;
    }

    public String getThreadId() {
        return threadId;
    }

    public void setThreadId(String threadId) {
        this.threadId = threadId;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBodySnippet() {
        return bodySnippet;
    }

    public void setBodySnippet(String bodySnippet) {
        this.bodySnippet = bodySnippet;
    }

    public String getBodyHtml() {
        return bodyHtml;
    }

    public void setBodyHtml(String bodyHtml) {
        this.bodyHtml = bodyHtml;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAiSummary() {
        return aiSummary;
    }

    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }

    public String getAiDraftReply() {
        return aiDraftReply;
    }

    public void setAiDraftReply(String aiDraftReply) {
        this.aiDraftReply = aiDraftReply;
    }

    public Instant getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(Instant receivedAt) {
        this.receivedAt = receivedAt;
    }
}
