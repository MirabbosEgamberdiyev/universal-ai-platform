package com.omniagent.modules.agents.repository;

import com.omniagent.modules.agents.domain.AgentDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgentDefinitionRepository extends JpaRepository<AgentDefinition, UUID> {

    List<AgentDefinition> findByOrganizationIdAndDeletedAtIsNullOrderByNameAsc(UUID organizationId);

    Optional<AgentDefinition> findByOrganizationIdAndAgentCodeAndDeletedAtIsNull(UUID organizationId, String agentCode);

    boolean existsByOrganizationIdAndAgentCode(UUID organizationId, String agentCode);
}
