package com.omniagent.modules.knowledge.repository;

import com.omniagent.modules.knowledge.domain.KnowledgeArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, UUID> {

    List<KnowledgeArticle> findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID organizationId);

    List<KnowledgeArticle> findByKnowledgeBaseIdAndDeletedAtIsNull(UUID knowledgeBaseId);
}
