package com.omniagent.modules.audit.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.audit.domain.AuditLog;
import com.omniagent.modules.audit.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<List<AuditLog>> listAuditLogs() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(auditLogService.listLogs(orgId));
    }
}
