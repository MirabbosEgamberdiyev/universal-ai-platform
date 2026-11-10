package com.omniagent.modules.business.domain;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "business_plans")
public class BusinessPlan extends TenantEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "plan_type", nullable = false)
    private String planType; // BUSINESS_PLAN, MARKET_RESEARCH, COMPETITOR_ANALYSIS, PROPOSAL

    @Column(name = "target_industry")
    private String targetIndustry;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content_json", nullable = false, columnDefinition = "jsonb")
    private String contentJson = "{}";

    @Column(name = "status", nullable = false)
    private String status = "DRAFT";

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPlanType() {
        return planType;
    }

    public void setPlanType(String planType) {
        this.planType = planType;
    }

    public String getTargetIndustry() {
        return targetIndustry;
    }

    public void setTargetIndustry(String targetIndustry) {
        this.targetIndustry = targetIndustry;
    }

    public String getContentJson() {
        return contentJson;
    }

    public void setContentJson(String contentJson) {
        this.contentJson = contentJson;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
