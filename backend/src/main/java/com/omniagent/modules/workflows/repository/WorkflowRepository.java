package com.omniagent.modules.workflows.repository;

import com.omniagent.modules.workflows.domain.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, UUID> {
    List<Workflow> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);
}
