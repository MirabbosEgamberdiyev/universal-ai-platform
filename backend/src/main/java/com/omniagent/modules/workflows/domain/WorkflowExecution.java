package com.omniagent.modules.workflows.domain;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "workflow_executions")
public class WorkflowExecution extends TenantEntity {

    @Column(name = "workflow_version_id", nullable = false)
    private UUID workflowVersionId;

    @Column(name = "trigger_type", nullable = false)
    private String triggerType; // NEW_INBOX_MESSAGE, SCHEDULED_CRON, NEW_POST_IDEA, WEBHOOK

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "trigger_payload", nullable = false, columnDefinition = "jsonb")
    private String triggerPayload;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "execution_state", nullable = false, columnDefinition = "jsonb")
    private String executionState;

    @Column(name = "status", nullable = false)
    private String status = "RUNNING"; // RUNNING, PAUSED_APPROVAL, COMPLETED, FAILED

    @Column(name = "started_at", nullable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "finished_at")
    private Instant finishedAt;

    public UUID getWorkflowVersionId() {
        return workflowVersionId;
    }

    public void setWorkflowVersionId(UUID workflowVersionId) {
        this.workflowVersionId = workflowVersionId;
    }

    public String getTriggerType() {
        return triggerType;
    }

    public void setTriggerType(String triggerType) {
        this.triggerType = triggerType;
    }

    public String getTriggerPayload() {
        return triggerPayload;
    }

    public void setTriggerPayload(String triggerPayload) {
        this.triggerPayload = triggerPayload;
    }

    public String getExecutionState() {
        return executionState;
    }

    public void setExecutionState(String executionState) {
        this.executionState = executionState;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(Instant finishedAt) {
        this.finishedAt = finishedAt;
    }
}
