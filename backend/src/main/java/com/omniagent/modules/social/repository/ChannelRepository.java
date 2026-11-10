package com.omniagent.modules.social.repository;

import com.omniagent.modules.social.domain.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChannelRepository extends JpaRepository<Channel, UUID> {
    List<Channel> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);
    List<Channel> findByConnectedAccountId(UUID connectedAccountId);
    Optional<Channel> findByOrganizationIdAndExternalChannelId(UUID organizationId, String externalChannelId);
    Optional<Channel> findFirstByExternalChannelId(String externalChannelId);
}
