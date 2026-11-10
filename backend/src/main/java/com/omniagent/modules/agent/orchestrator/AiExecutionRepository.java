package com.omniagent.modules.agent.orchestrator;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiExecutionRepository extends JpaRepository<AiExecution, UUID> {
    List<AiExecution> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
}
