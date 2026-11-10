package com.omniagent.modules.agents.service;

import com.omniagent.modules.ai.provider.AiProvider.AiProviderResult;
import com.omniagent.modules.ai.service.AiProviderRouter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public abstract class BaseSpecializedAgent implements SpecializedAgent {

    protected final Logger log = LoggerFactory.getLogger(getClass());
    protected final AiProviderRouter aiRouter;

    protected BaseSpecializedAgent(AiProviderRouter aiRouter) {
        this.aiRouter = aiRouter;
    }

    @Override
    public AgentExecutionResult execute(AgentContext context, String taskPrompt) {
        log.info("Agent [{}] executing task for org [{}]", getAgentCode(), context.organizationId());

        StringBuilder fullSystemPrompt = new StringBuilder(getDefaultSystemPrompt());
        if (context.brandVoice() != null && !context.brandVoice().isBlank()) {
            fullSystemPrompt.append("\n\nBrand Voice Guidelines:\n").append(context.brandVoice());
        }
        fullSystemPrompt.append("\nPreferred Output Language: ").append(context.preferredLanguage());
        fullSystemPrompt.append("\nAuthorized Tools: ").append(String.join(", ", getAllowedTools()));

        try {
            AiProviderResult result = aiRouter.generateText(fullSystemPrompt.toString(), taskPrompt);
            if (result.success()) {
                return AgentExecutionResult.successful(
                        getAgentCode(),
                        result.content(),
                        getAllowedTools(),
                        result.promptTokens() + result.completionTokens()
                );
            } else {
                return AgentExecutionResult.failed(getAgentCode(), result.errorMessage());
            }
        } catch (Exception e) {
            log.error("Agent [{}] execution error: {}", getAgentCode(), e.getMessage());
            return AgentExecutionResult.failed(getAgentCode(), e.getMessage());
        }
    }
}
