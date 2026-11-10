package com.omniagent;

import com.omniagent.modules.agent.approval.AiApproval;
import com.omniagent.modules.agent.approval.AiApprovalService;
import com.omniagent.modules.agent.orchestrator.AiAgentOrchestrator;
import com.omniagent.modules.agent.orchestrator.AiAgentOrchestrator.AgentChatResponse;
import com.omniagent.modules.agent.orchestrator.AiExecution;
import com.omniagent.modules.agent.orchestrator.AiExecutionRepository;
import com.omniagent.modules.ai.provider.AiProvider.AiProviderResult;
import com.omniagent.modules.ai.service.AiProviderRouter;
import com.omniagent.modules.iam.domain.Organization;
import com.omniagent.modules.iam.repository.OrganizationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

public class AiAgentOrchestratorTest {

    private AiProviderRouter aiRouter;
    private AiExecutionRepository executionRepository;
    private AiApprovalService approvalService;
    private OrganizationRepository organizationRepository;
    private AiAgentOrchestrator orchestrator;

    @BeforeEach
    void setUp() {
        aiRouter = Mockito.mock(AiProviderRouter.class);
        executionRepository = Mockito.mock(AiExecutionRepository.class);
        approvalService = Mockito.mock(AiApprovalService.class);
        organizationRepository = Mockito.mock(OrganizationRepository.class);
        com.omniagent.modules.vault.service.TokenVaultService tokenVaultService = Mockito.mock(com.omniagent.modules.vault.service.TokenVaultService.class);

        orchestrator = new AiAgentOrchestrator(
                aiRouter,
                executionRepository,
                approvalService,
                organizationRepository,
                tokenVaultService
        );
    }

    @Test
    @DisplayName("Mode 3 (OPERATOR): Should create an approval gate for social publishing actions")
    void testOperatorModeRequiresApproval() {
        UUID orgId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Organization org = new Organization();
        org.setId(orgId);
        org.setAutonomyMode("OPERATOR");
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(org));

        String planJson = "{\"intent\":\"PUBLISH_POST\",\"actionSummary\":\"Publish to Telegram\",\"requiresApproval\":true}";
        when(aiRouter.generateStructuredJson(anyString(), anyString(), anyString(), any(), any(), any(), any()))
                .thenReturn(new AiProviderResult(true, planJson, 40, 60, "gemini-1.5-pro", null));

        AiExecution savedExecution = new AiExecution();
        savedExecution.setId(UUID.randomUUID());
        when(executionRepository.save(any(AiExecution.class))).thenReturn(savedExecution);

        AiApproval savedApproval = new AiApproval();
        savedApproval.setId(UUID.randomUUID());
        when(approvalService.createPendingApproval(any(), any(), any(), any())).thenReturn(savedApproval);

        AgentChatResponse response = orchestrator.processInstruction(orgId, userId, "Bugun Telegram kanalimga post chiqar");

        assertNotNull(response);
        assertEquals("AWAITING_APPROVAL", response.status());
        assertNotNull(response.pendingApprovalId());
        assertEquals("PUBLISH_POST", response.intent());
    }

    @Test
    @DisplayName("Mode 1 (ADVISOR): Should return recommendations without triggering approval gates")
    void testAdvisorModeNoApproval() {
        UUID orgId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Organization org = new Organization();
        org.setId(orgId);
        org.setAutonomyMode("ADVISOR");
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(org));

        String planJson = "{\"intent\":\"ANALYZE_COMMENTS\",\"actionSummary\":\"Review comment sentiment\"}";
        when(aiRouter.generateStructuredJson(anyString(), anyString(), anyString(), any(), any(), any(), any()))
                .thenReturn(new AiProviderResult(true, planJson, 30, 45, "gemini-1.5-pro", null));

        AiExecution savedExecution = new AiExecution();
        savedExecution.setId(UUID.randomUUID());
        when(executionRepository.save(any(AiExecution.class))).thenReturn(savedExecution);

        AgentChatResponse response = orchestrator.processInstruction(orgId, userId, "Kommentariyalarni tahlil qil");

        assertNotNull(response);
        assertEquals("COMPLETED", response.status());
        assertNull(response.pendingApprovalId());
        assertTrue(response.responseMessage().contains("Advisor Mode Active"));
    }
}
