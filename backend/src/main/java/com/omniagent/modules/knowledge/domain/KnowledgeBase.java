package com.omniagent.modules.knowledge.domain;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "knowledge_bases")
public class KnowledgeBase extends TenantEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "scope", nullable = false)
    private String scope = "ORGANIZATION"; // PERSONAL, ORGANIZATION, TEAM

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }
}
