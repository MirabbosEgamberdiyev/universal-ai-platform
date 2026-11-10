package com.omniagent.modules.publishing.repository;

import com.omniagent.modules.publishing.domain.PublicationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PublicationResultRepository extends JpaRepository<PublicationResult, UUID> {
    Optional<PublicationResult> findFirstByPublicationJobIdOrderByCreatedAtDesc(UUID publicationJobId);
    Optional<PublicationResult> findByPublicationJobId(UUID publicationJobId);
}
