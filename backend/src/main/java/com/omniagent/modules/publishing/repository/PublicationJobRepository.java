package com.omniagent.modules.publishing.repository;

import com.omniagent.modules.publishing.domain.PublicationJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface PublicationJobRepository extends JpaRepository<PublicationJob, UUID> {
    List<PublicationJob> findByStatusAndScheduledForLessThanEqual(String status, Instant scheduledFor);
    List<PublicationJob> findByOrganizationIdAndScheduledForBetweenOrderByScheduledForAsc(UUID organizationId, Instant start, Instant end);
    List<PublicationJob> findByOrganizationIdOrderByScheduledForDesc(UUID organizationId);
    List<PublicationJob> findByContentId(UUID contentId);
}
