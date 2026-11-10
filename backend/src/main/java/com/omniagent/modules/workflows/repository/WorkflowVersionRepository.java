package com.omniagent.modules.workflows.repository;

import com.omniagent.modules.workflows.domain.WorkflowVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkflowVersionRepository extends JpaRepository<WorkflowVersion, UUID> {
    List<WorkflowVersion> findByWorkflowIdOrderByVersionNumberDesc(UUID workflowId);
    Optional<WorkflowVersion> findFirstByWorkflowIdOrderByVersionNumberDesc(UUID workflowId);
}
