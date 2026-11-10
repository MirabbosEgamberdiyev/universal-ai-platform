package com.omniagent.modules.social.repository;

import com.omniagent.modules.social.domain.OAuthCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OAuthCredentialRepository extends JpaRepository<OAuthCredential, UUID> {
    Optional<OAuthCredential> findByConnectedAccountId(UUID connectedAccountId);
}
