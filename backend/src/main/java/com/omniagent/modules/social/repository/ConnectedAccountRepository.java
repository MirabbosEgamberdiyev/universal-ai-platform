package com.omniagent.modules.social.repository;

import com.omniagent.modules.social.domain.ConnectedAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConnectedAccountRepository extends JpaRepository<ConnectedAccount, UUID> {
    List<ConnectedAccount> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);
    Optional<ConnectedAccount> findByOrganizationIdAndPlatformAndPlatformAccountId(UUID organizationId, String platform, String platformAccountId);
}
