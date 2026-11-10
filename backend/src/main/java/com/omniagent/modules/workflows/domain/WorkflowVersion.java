package com.omniagent.modules.workflows.domain;

import com.omniagent.common.domain.BaseEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

@Entity
@Table(name = "workflow_versions", uniqueConstraints = {
    @UniqueConstraint(name = "uq_workflow_version", columnNames = {"workflow_id", "version_number"})
})
public class WorkflowVersion extends BaseEntity {

    @Column(name = "workflow_id", nullable = false)
    private UUID workflowId;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "graph_definition", nullable = false, columnDefinition = "jsonb")
    private String graphDefinition; // Nodes and edges

    public UUID getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(UUID workflowId) {
        this.workflowId = workflowId;
    }

    public Integer getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(Integer versionNumber) {
        this.versionNumber = versionNumber;
    }

    public String getGraphDefinition() {
        return graphDefinition;
    }

    public void setGraphDefinition(String graphDefinition) {
        this.graphDefinition = graphDefinition;
    }
}
