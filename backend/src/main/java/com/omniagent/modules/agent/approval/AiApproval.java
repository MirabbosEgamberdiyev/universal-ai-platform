package com.omniagent.modules.agent.approval;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_approvals")
public class AiApproval extends TenantEntity {

    @Column(name = "ai_execution_id", nullable = false)
    private UUID aiExecutionId;

    @Column(name = "action_type", nullable = false)
    private String actionType; // PUBLISH_POST, SEND_DM, DELETE_RESOURCE, BAN_USER

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload_preview", nullable = false, columnDefinition = "jsonb")
    private String payloadPreview;

    @Column(name = "status", nullable = false)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, EXPIRED

    @Column(name = "reviewed_by_user_id")
    private UUID reviewedByUserId;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    public UUID getAiExecutionId() {
        return aiExecutionId;
    }

    public void setAiExecutionId(UUID aiExecutionId) {
        this.aiExecutionId = aiExecutionId;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getPayloadPreview() {
        return payloadPreview;
    }

    public void setPayloadPreview(String payloadPreview) {
        this.payloadPreview = payloadPreview;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public UUID getReviewedByUserId() {
        return reviewedByUserId;
    }

    public void setReviewedByUserId(UUID reviewedByUserId) {
        this.reviewedByUserId = reviewedByUserId;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(Instant reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }
}
