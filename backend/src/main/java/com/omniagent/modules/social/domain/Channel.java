package com.omniagent.modules.social.domain;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

@Entity
@Table(name = "channels")
public class Channel extends TenantEntity {

    @Column(name = "connected_account_id", nullable = false)
    private UUID connectedAccountId;

    @Column(name = "external_channel_id", nullable = false)
    private String externalChannelId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "channel_type", nullable = false)
    private String channelType; // TG_CHANNEL, TG_GROUP, IG_FEED, FB_PAGE, LI_ORG

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "settings", columnDefinition = "jsonb")
    private String settings = "{}";

    public UUID getConnectedAccountId() {
        return connectedAccountId;
    }

    public void setConnectedAccountId(UUID connectedAccountId) {
        this.connectedAccountId = connectedAccountId;
    }

    public String getExternalChannelId() {
        return externalChannelId;
    }

    public void setExternalChannelId(String externalChannelId) {
        this.externalChannelId = externalChannelId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getChannelType() {
        return channelType;
    }

    public void setChannelType(String channelType) {
        this.channelType = channelType;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }

    public String getSettings() {
        return settings;
    }

    public void setSettings(String settings) {
        this.settings = settings;
    }
}
