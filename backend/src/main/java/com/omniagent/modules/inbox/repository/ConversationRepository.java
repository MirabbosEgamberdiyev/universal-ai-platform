package com.omniagent.modules.inbox.repository;

import com.omniagent.modules.inbox.domain.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    List<Conversation> findByOrganizationIdAndDeletedAtIsNullOrderByLastMessageAtDesc(UUID organizationId);
    Optional<Conversation> findByOrganizationIdAndChannelIdAndExternalSenderId(UUID organizationId, UUID channelId, String externalSenderId);
}
