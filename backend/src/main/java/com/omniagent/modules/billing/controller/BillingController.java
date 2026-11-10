package com.omniagent.modules.billing.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.billing.service.BillingService;
import com.omniagent.modules.billing.service.BillingService.CheckoutSessionResponse;
import com.omniagent.modules.billing.service.BillingService.OrganizationSubscriptionStatus;
import com.omniagent.modules.billing.service.BillingService.SubscriptionPlan;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billing")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlan>> getPlans() {
        return ResponseEntity.ok(billingService.getAvailablePlans());
    }

    @GetMapping("/status")
    public ResponseEntity<OrganizationSubscriptionStatus> getStatus() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(billingService.getSubscriptionStatus(orgId));
    }

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutSessionResponse> createCheckoutSession(@RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        String planCode = body.get("planCode");
        String provider = body.getOrDefault("provider", "STRIPE");
        return ResponseEntity.ok(billingService.createCheckoutSession(orgId, planCode, provider));
    }
}
