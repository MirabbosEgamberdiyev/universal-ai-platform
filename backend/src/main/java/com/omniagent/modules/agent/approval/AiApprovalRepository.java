package com.omniagent.modules.agent.approval;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiApprovalRepository extends JpaRepository<AiApproval, UUID> {
    List<AiApproval> findByOrganizationIdAndStatusOrderByCreatedAtDesc(UUID organizationId, String status);
    List<AiApproval> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
}
