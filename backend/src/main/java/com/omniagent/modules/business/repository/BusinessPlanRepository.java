package com.omniagent.modules.business.repository;

import com.omniagent.modules.business.domain.BusinessPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BusinessPlanRepository extends JpaRepository<BusinessPlan, UUID> {

    List<BusinessPlan> findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID organizationId);

    List<BusinessPlan> findByOrganizationIdAndPlanTypeAndDeletedAtIsNullOrderByCreatedAtDesc(UUID organizationId, String planType);
}
