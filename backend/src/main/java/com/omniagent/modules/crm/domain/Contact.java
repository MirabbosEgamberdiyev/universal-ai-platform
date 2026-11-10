package com.omniagent.modules.crm.domain;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "crm_contacts")
public class Contact extends TenantEntity {

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "platform_handles", columnDefinition = "jsonb")
    private String platformHandles = "{}";

    @Column(name = "stage", nullable = false)
    private String stage = "LEAD"; // LEAD, CONTACTED, QUALIFIED, PROPOSAL, WON, LOST

    @Column(name = "tags")
    private String[] tags = new String[0];

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPlatformHandles() {
        return platformHandles;
    }

    public void setPlatformHandles(String platformHandles) {
        this.platformHandles = platformHandles;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
