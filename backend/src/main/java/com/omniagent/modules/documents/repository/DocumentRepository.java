package com.omniagent.modules.documents.repository;

import com.omniagent.modules.documents.domain.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {

    List<Document> findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID organizationId);

    List<Document> findByOrganizationIdAndFileTypeAndDeletedAtIsNullOrderByCreatedAtDesc(UUID organizationId, String fileType);
}
