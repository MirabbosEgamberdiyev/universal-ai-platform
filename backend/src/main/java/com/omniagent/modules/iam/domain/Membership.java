package com.omniagent.modules.iam.domain;

import com.omniagent.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "memberships", uniqueConstraints = {
    @UniqueConstraint(name = "uq_membership", columnNames = {"organization_id", "user_id"})
})
public class Membership extends BaseEntity {

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "role_id", nullable = false)
    private UUID roleId;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE"; // ACTIVE, INVITED, SUSPENDED

    public UUID getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(UUID organizationId) {
        this.organizationId = organizationId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getRoleId() {
        return roleId;
    }

    public void setRoleId(UUID roleId) {
        this.roleId = roleId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
