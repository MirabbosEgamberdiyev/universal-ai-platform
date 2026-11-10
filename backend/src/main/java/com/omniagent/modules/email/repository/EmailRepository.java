package com.omniagent.modules.email.repository;

import com.omniagent.modules.email.domain.Email;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailRepository extends JpaRepository<Email, UUID> {

    List<Email> findByOrganizationIdAndDeletedAtIsNullOrderByReceivedAtDesc(UUID organizationId);

    List<Email> findByOrganizationIdAndCategoryAndDeletedAtIsNullOrderByReceivedAtDesc(UUID organizationId, String category);

    List<Email> findByEmailAccountIdAndDeletedAtIsNullOrderByReceivedAtDesc(UUID emailAccountId);

    Optional<Email> findByOrganizationIdAndExternalMessageId(UUID organizationId, String externalMessageId);
}
