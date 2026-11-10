package com.omniagent.modules.documents.repository;

import com.omniagent.modules.documents.domain.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, UUID> {

    List<DocumentChunk> findByDocumentIdOrderByChunkIndexAsc(UUID documentId);

    List<DocumentChunk> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);
}
