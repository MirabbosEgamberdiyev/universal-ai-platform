package com.omniagent.modules.email.domain;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "email_accounts")
public class EmailAccount extends TenantEntity {

    @Column(name = "provider", nullable = false)
    private String provider; // GMAIL, OUTLOOK, IMAP

    @Column(name = "email_address", nullable = false)
    private String emailAddress;

    @Column(name = "account_name", nullable = false)
    private String accountName;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "sync_status", nullable = false)
    private String syncStatus = "SYNCED";

    @Column(name = "last_synced_at")
    private Instant lastSyncedAt = Instant.now();

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }

    public String getSyncStatus() {
        return syncStatus;
    }

    public void setSyncStatus(String syncStatus) {
        this.syncStatus = syncStatus;
    }

    public Instant getLastSyncedAt() {
        return lastSyncedAt;
    }

    public void setLastSyncedAt(Instant lastSyncedAt) {
        this.lastSyncedAt = lastSyncedAt;
    }
}
