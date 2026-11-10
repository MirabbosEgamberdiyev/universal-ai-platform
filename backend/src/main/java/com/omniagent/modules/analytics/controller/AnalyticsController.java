package com.omniagent.modules.analytics.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.analytics.service.AnalyticsService;
import com.omniagent.modules.analytics.service.AnalyticsService.DashboardKpiOverview;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardKpiOverview> getDashboardOverview() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(analyticsService.getDashboardOverview(orgId));
    }
}
