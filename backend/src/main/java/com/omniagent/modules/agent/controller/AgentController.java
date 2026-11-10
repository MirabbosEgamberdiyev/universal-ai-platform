package com.omniagent.modules.agent.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.agent.approval.AiApproval;
import com.omniagent.modules.agent.approval.AiApprovalService;
import com.omniagent.modules.agent.orchestrator.AiAgentOrchestrator;
import com.omniagent.modules.agent.orchestrator.AiAgentOrchestrator.AgentChatResponse;
import com.omniagent.modules.agent.orchestrator.AiExecution;
import com.omniagent.modules.agent.orchestrator.AiExecutionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agent")
public class AgentController {

    private final AiAgentOrchestrator orchestrator;
    private final AiApprovalService approvalService;
    private final AiExecutionRepository executionRepository;

    public AgentController(
            AiAgentOrchestrator orchestrator,
            AiApprovalService approvalService,
            AiExecutionRepository executionRepository) {
        this.orchestrator = orchestrator;
        this.approvalService = approvalService;
        this.executionRepository = executionRepository;
    }

    @PostMapping("/chat")
    public ResponseEntity<AgentChatResponse> chat(
            Authentication authentication,
            @RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        UUID userId = UUID.fromString(authentication.getName());
        String prompt = body.get("message");
        return ResponseEntity.ok(orchestrator.processInstruction(orgId, userId, prompt));
    }

    @GetMapping("/approvals/pending")
    public ResponseEntity<List<AiApproval>> getPendingApprovals() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(approvalService.getPendingApprovals(orgId));
    }

    @GetMapping("/approvals")
    public ResponseEntity<List<AiApproval>> getAllApprovals() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(approvalService.getAllApprovals(orgId));
    }

    @PostMapping("/approvals/{id}/review")
    public ResponseEntity<AiApproval> reviewApproval(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        UUID reviewerUserId = UUID.fromString(authentication.getName());
        String decision = body.get("decision"); // APPROVE or REJECT
        String reason = body.get("rejectionReason");
        return ResponseEntity.ok(approvalService.reviewApproval(orgId, id, reviewerUserId, decision, reason));
    }

    @GetMapping("/executions")
    public ResponseEntity<List<AiExecution>> getExecutions() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(executionRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId));
    }
}
