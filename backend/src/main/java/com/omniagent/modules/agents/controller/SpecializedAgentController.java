package com.omniagent.modules.agents.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.agents.domain.AgentDefinition;
import com.omniagent.modules.agents.service.AgentRegistry;
import com.omniagent.modules.agents.service.SpecializedAgent.AgentExecutionResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agents")
public class SpecializedAgentController {

    private final AgentRegistry agentRegistry;

    public SpecializedAgentController(AgentRegistry agentRegistry) {
        this.agentRegistry = agentRegistry;
    }

    @GetMapping
    public ResponseEntity<List<AgentDefinition>> listAgents() {
        UUID orgId = TenantContext.getOrganizationId();
        List<AgentDefinition> agents = agentRegistry.getOrSeedOrganizationAgents(orgId);
        return ResponseEntity.ok(agents);
    }

    @PostMapping("/{agentCode}/delegate")
    public ResponseEntity<AgentExecutionResult> delegateTask(
            @PathVariable String agentCode,
            @RequestBody Map<String, String> request) {
        UUID orgId = TenantContext.getOrganizationId();
        String taskPrompt = request.getOrDefault("taskPrompt", "");
        String brandVoice = request.getOrDefault("brandVoice", "");
        String language = request.getOrDefault("language", "uz-Latn");

        AgentExecutionResult result = agentRegistry.delegateTask(orgId, null, agentCode, taskPrompt, brandVoice, language);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{agentCode}/toggle")
    public ResponseEntity<AgentDefinition> toggleAgent(
            @PathVariable String agentCode,
            @RequestBody Map<String, Boolean> request) {
        UUID orgId = TenantContext.getOrganizationId();
        boolean enabled = request.getOrDefault("enabled", true);
        AgentDefinition updated = agentRegistry.toggleAgent(orgId, agentCode, enabled);
        return ResponseEntity.ok(updated);
    }
}
