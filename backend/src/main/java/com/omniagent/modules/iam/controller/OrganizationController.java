package com.omniagent.modules.iam.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.iam.dto.AuthDtos.*;
import com.omniagent.modules.iam.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @GetMapping
    public ResponseEntity<List<OrgSummary>> getUserOrganizations(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(organizationService.getUserOrganizations(userId));
    }

    @PostMapping
    public ResponseEntity<OrgSummary> createOrganization(
            Authentication authentication,
            @Valid @RequestBody CreateOrgRequest request) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(organizationService.createOrganization(userId, request));
    }

    @PostMapping("/switch")
    public ResponseEntity<AuthResponse> switchOrganization(
            Authentication authentication,
            @Valid @RequestBody SwitchOrgRequest request) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(organizationService.switchOrganization(userId, request.organizationId()));
    }

    @PatchMapping("/autonomy-mode")
    public ResponseEntity<OrgSummary> updateAutonomyMode(@RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        String mode = body.get("autonomyMode");
        return ResponseEntity.ok(organizationService.updateAutonomyMode(orgId, mode));
    }

    @GetMapping("/ai-config")
    public ResponseEntity<Map<String, Object>> getAiConfig() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(organizationService.getAiConfig(orgId));
    }

    @PutMapping("/ai-config")
    public ResponseEntity<Map<String, Object>> updateAiConfig(@RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(organizationService.updateAiConfig(orgId, body));
    }

    @PostMapping("/ai-config/test")
    public ResponseEntity<Map<String, Object>> testAiConnection(@RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        String provider = body.getOrDefault("provider", "GEMINI");
        String apiKey = body.get("apiKey");
        return ResponseEntity.ok(organizationService.testAiConnection(orgId, provider, apiKey));
    }
}
