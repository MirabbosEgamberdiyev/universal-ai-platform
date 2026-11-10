package com.omniagent.modules.business.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.business.domain.BusinessPlan;
import com.omniagent.modules.business.service.BusinessAssistantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/business")
public class BusinessController {

    private final BusinessAssistantService businessService;

    public BusinessController(BusinessAssistantService businessService) {
        this.businessService = businessService;
    }

    @GetMapping("/plans")
    public ResponseEntity<List<BusinessPlan>> listPlans() {
        UUID orgId = TenantContext.getOrganizationId();
        return ResponseEntity.ok(businessService.listPlans(orgId));
    }

    @PostMapping("/research")
    public ResponseEntity<BusinessPlan> createMarketResearch(@RequestBody Map<String, String> request) {
        UUID orgId = TenantContext.getOrganizationId();
        String industry = request.getOrDefault("industry", "SaaS");
        String competitors = request.getOrDefault("competitors", "Competitor A, Competitor B");
        String geo = request.getOrDefault("geo", "Global / Central Asia");

        return ResponseEntity.ok(businessService.generateMarketResearch(orgId, industry, competitors, geo));
    }

    @PostMapping("/proposal")
    public ResponseEntity<BusinessPlan> createProposal(@RequestBody Map<String, String> request) {
        UUID orgId = TenantContext.getOrganizationId();
        String clientName = request.getOrDefault("clientName", "Enterprise Client");
        String scope = request.getOrDefault("scope", "Platform implementation");
        String budget = request.getOrDefault("budget", "$10,000");

        return ResponseEntity.ok(businessService.generateCommercialProposal(orgId, clientName, scope, budget));
    }
}
