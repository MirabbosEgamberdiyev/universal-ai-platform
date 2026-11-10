package com.omniagent.modules.knowledge.repository;

import com.omniagent.modules.knowledge.domain.KnowledgeBase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface KnowledgeBaseRepository extends JpaRepository<KnowledgeBase, UUID> {

    List<KnowledgeBase> findByOrganizationIdAndDeletedAtIsNullOrderByNameAsc(UUID organizationId);
}
