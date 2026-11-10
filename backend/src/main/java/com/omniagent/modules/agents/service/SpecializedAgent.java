package com.omniagent.modules.agents.service;

import java.util.List;
import java.util.UUID;

public interface SpecializedAgent {

    String getAgentCode();

    String getName();

    String getDomain();

    String getDescription();

    String getDefaultSystemPrompt();

    List<String> getAllowedTools();

    boolean requiresMode3Approval();

    AgentExecutionResult execute(AgentContext context, String taskPrompt);

    record AgentContext(
            UUID organizationId,
            UUID userId,
            String brandVoice,
            String preferredLanguage
    ) {}

    record AgentExecutionResult(
            boolean success,
            String agentCode,
            String outputText,
            List<String> toolsInvoked,
            int tokensUsed,
            String approvalId,
            String errorMessage
    ) {
        public static AgentExecutionResult successful(String agentCode, String outputText, List<String> toolsInvoked, int tokensUsed) {
            return new AgentExecutionResult(true, agentCode, outputText, toolsInvoked, tokensUsed, null, null);
        }

        public static AgentExecutionResult awaitingApproval(String agentCode, String outputText, String approvalId, List<String> toolsInvoked) {
            return new AgentExecutionResult(true, agentCode, outputText, toolsInvoked, 0, approvalId, null);
        }

        public static AgentExecutionResult failed(String agentCode, String errorMessage) {
            return new AgentExecutionResult(false, agentCode, null, List.of(), 0, null, errorMessage);
        }
    }
}
