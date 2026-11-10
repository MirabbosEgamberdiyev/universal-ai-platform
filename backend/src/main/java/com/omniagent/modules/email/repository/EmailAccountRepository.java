package com.omniagent.modules.email.repository;

import com.omniagent.modules.email.domain.EmailAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailAccountRepository extends JpaRepository<EmailAccount, UUID> {

    List<EmailAccount> findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID organizationId);

    Optional<EmailAccount> findByOrganizationIdAndEmailAddressAndDeletedAtIsNull(UUID organizationId, String emailAddress);
}
