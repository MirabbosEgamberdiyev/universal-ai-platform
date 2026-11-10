package com.omniagent.modules.workflows.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.workflows.domain.Workflow;
import com.omniagent.modules.workflows.domain.WorkflowExecution;
import com.omniagent.modules.workflows.domain.WorkflowVersion;
import com.omniagent.modules.workflows.service.WorkflowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workflows")
public class WorkflowController {

    private final WorkflowService workflowService;

    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping
    public ResponseEntity<List<Workflow>> listWorkflows() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(workflowService.listWorkflows(orgId));
    }

    @PostMapping
    public ResponseEntity<Workflow> createWorkflow(@RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        String name = body.get("name");
        String desc = body.get("description");
        String graph = body.get("graphDefinition");
        return ResponseEntity.ok(workflowService.createWorkflow(orgId, name, desc, graph));
    }

    @PostMapping("/{id}/versions")
    public ResponseEntity<WorkflowVersion> publishVersion(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        String graph = body.get("graphDefinition");
        return ResponseEntity.ok(workflowService.publishNewVersion(orgId, id, graph));
    }

    @PostMapping("/{id}/trigger")
    public ResponseEntity<WorkflowExecution> triggerWorkflow(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        String triggerType = body.getOrDefault("triggerType", "MANUAL");
        String payload = body.getOrDefault("payload", "{}");
        return ResponseEntity.ok(workflowService.triggerWorkflow(orgId, id, triggerType, payload));
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<Workflow> toggleWorkflow(@PathVariable UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(workflowService.toggleActive(orgId, id));
    }

    @GetMapping("/executions")
    public ResponseEntity<List<WorkflowExecution>> getExecutions() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(workflowService.getExecutionHistory(orgId));
    }
}
