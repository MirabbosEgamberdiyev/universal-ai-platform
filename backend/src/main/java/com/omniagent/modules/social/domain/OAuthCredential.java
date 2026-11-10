package com.omniagent.modules.social.domain;

import com.omniagent.common.domain.BaseEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "oauth_credentials")
public class OAuthCredential extends BaseEntity {

    @Column(name = "connected_account_id", nullable = false)
    private UUID connectedAccountId;

    @Column(name = "key_id", nullable = false)
    private String keyId;

    @Column(name = "encrypted_access_token", nullable = false)
    private byte[] encryptedAccessToken;

    @Column(name = "encrypted_refresh_token")
    private byte[] encryptedRefreshToken;

    @Column(name = "token_type")
    private String tokenType = "Bearer";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "scopes", columnDefinition = "jsonb")
    private String scopes = "[]";

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "last_refreshed_at")
    private Instant lastRefreshedAt;

    public UUID getConnectedAccountId() {
        return connectedAccountId;
    }

    public void setConnectedAccountId(UUID connectedAccountId) {
        this.connectedAccountId = connectedAccountId;
    }

    public String getKeyId() {
        return keyId;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }

    public byte[] getEncryptedAccessToken() {
        return encryptedAccessToken;
    }

    public void setEncryptedAccessToken(byte[] encryptedAccessToken) {
        this.encryptedAccessToken = encryptedAccessToken;
    }

    public byte[] getEncryptedRefreshToken() {
        return encryptedRefreshToken;
    }

    public void setEncryptedRefreshToken(byte[] encryptedRefreshToken) {
        this.encryptedRefreshToken = encryptedRefreshToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getScopes() {
        return scopes;
    }

    public void setScopes(String scopes) {
        this.scopes = scopes;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getLastRefreshedAt() {
        return lastRefreshedAt;
    }

    public void setLastRefreshedAt(Instant lastRefreshedAt) {
        this.lastRefreshedAt = lastRefreshedAt;
    }
}
