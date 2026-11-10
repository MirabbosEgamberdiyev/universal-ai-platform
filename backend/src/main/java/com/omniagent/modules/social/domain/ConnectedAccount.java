package com.omniagent.modules.social.domain;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "connected_accounts", uniqueConstraints = {
    @UniqueConstraint(name = "uq_platform_account", columnNames = {"organization_id", "platform", "platform_account_id"})
})
public class ConnectedAccount extends TenantEntity {

    @Column(name = "platform", nullable = false)
    private String platform; // TELEGRAM, INSTAGRAM, FACEBOOK, TIKTOK, YOUTUBE, LINKEDIN, TWITTER

    @Column(name = "platform_account_id", nullable = false)
    private String platformAccountId;

    @Column(name = "account_name", nullable = false)
    private String accountName;

    @Column(name = "username")
    private String username;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "account_type")
    private String accountType; // BUSINESS, CREATOR, CHANNEL, BOT

    @Column(name = "status", nullable = false)
    private String status = "CONNECTED"; // CONNECTED, EXPIRED, REVOKED, ERROR

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getPlatformAccountId() {
        return platformAccountId;
    }

    public void setPlatformAccountId(String platformAccountId) {
        this.platformAccountId = platformAccountId;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
