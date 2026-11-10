package com.omniagent.modules.agent.orchestrator;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_executions")
public class AiExecution extends TenantEntity {

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "prompt_text", nullable = false, columnDefinition = "TEXT")
    private String promptText;

    @Column(name = "detected_intent", nullable = false)
    private String detectedIntent;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "execution_plan", nullable = false, columnDefinition = "jsonb")
    private String executionPlan;

    @Column(name = "tokens_consumed", nullable = false)
    private Integer tokensConsumed = 0;

    @Column(name = "estimated_cost_usd", precision = 10, scale = 6)
    private BigDecimal estimatedCostUsd = BigDecimal.ZERO;

    @Column(name = "status", nullable = false)
    private String status; // PLANNING, AWAITING_APPROVAL, EXECUTING, COMPLETED, FAILED

    @Column(name = "error_details")
    private String errorDetails;

    @Column(name = "completed_at")
    private Instant completedAt;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getPromptText() {
        return promptText;
    }

    public void setPromptText(String promptText) {
        this.promptText = promptText;
    }

    public String getDetectedIntent() {
        return detectedIntent;
    }

    public void setDetectedIntent(String detectedIntent) {
        this.detectedIntent = detectedIntent;
    }

    public String getExecutionPlan() {
        return executionPlan;
    }

    public void setExecutionPlan(String executionPlan) {
        this.executionPlan = executionPlan;
    }

    public Integer getTokensConsumed() {
        return tokensConsumed;
    }

    public void setTokensConsumed(Integer tokensConsumed) {
        this.tokensConsumed = tokensConsumed;
    }

    public BigDecimal getEstimatedCostUsd() {
        return estimatedCostUsd;
    }

    public void setEstimatedCostUsd(BigDecimal estimatedCostUsd) {
        this.estimatedCostUsd = estimatedCostUsd;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorDetails() {
        return errorDetails;
    }

    public void setErrorDetails(String errorDetails) {
        this.errorDetails = errorDetails;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }
}
