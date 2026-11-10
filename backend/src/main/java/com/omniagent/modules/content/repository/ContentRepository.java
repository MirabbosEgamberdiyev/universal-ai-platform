package com.omniagent.modules.content.repository;

import com.omniagent.modules.content.domain.Content;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContentRepository extends JpaRepository<Content, UUID> {
    List<Content> findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID organizationId);
    List<Content> findByOrganizationIdAndStatusAndDeletedAtIsNull(UUID organizationId, String status);
}
