package com.omniagent.modules.agents.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.modules.agents.domain.AgentDefinition;
import com.omniagent.modules.agents.repository.AgentDefinitionRepository;
import com.omniagent.modules.agents.service.SpecializedAgent.AgentContext;
import com.omniagent.modules.agents.service.SpecializedAgent.AgentExecutionResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AgentRegistry {

    private static final Logger log = LoggerFactory.getLogger(AgentRegistry.class);

    private final Map<String, SpecializedAgent> agentsByCode = new ConcurrentHashMap<>();
    private final AgentDefinitionRepository definitionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AgentRegistry(List<SpecializedAgent> agents, AgentDefinitionRepository definitionRepository) {
        this.definitionRepository = definitionRepository;
        for (SpecializedAgent agent : agents) {
            this.agentsByCode.put(agent.getAgentCode(), agent);
            log.info("Registered Specialized Agent: [{}] - {}", agent.getAgentCode(), agent.getName());
        }
    }

    public List<SpecializedAgent> getAllRegisteredAgents() {
        return new ArrayList<>(agentsByCode.values());
    }

    public Optional<SpecializedAgent> getAgent(String agentCode) {
        return Optional.ofNullable(agentsByCode.get(agentCode));
    }

    @Transactional
    public List<AgentDefinition> getOrSeedOrganizationAgents(UUID organizationId) {
        List<AgentDefinition> existing = definitionRepository.findByOrganizationIdAndDeletedAtIsNullOrderByNameAsc(organizationId);
        Set<String> existingCodes = new HashSet<>();
        for (AgentDefinition def : existing) {
            existingCodes.add(def.getAgentCode());
        }

        List<AgentDefinition> result = new ArrayList<>(existing);
        for (SpecializedAgent agent : agentsByCode.values()) {
            if (!existingCodes.contains(agent.getAgentCode())) {
                AgentDefinition def = new AgentDefinition();
                def.setOrganizationId(organizationId);
                def.setAgentCode(agent.getAgentCode());
                def.setName(agent.getName());
                def.setDomain(agent.getDomain());
                def.setSystemPrompt(agent.getDefaultSystemPrompt());
                try {
                    def.setAllowedTools(objectMapper.writeValueAsString(agent.getAllowedTools()));
                } catch (JsonProcessingException e) {
                    def.setAllowedTools("[]");
                }
                def.setEnabled(true);
                def.setExecutionsCount(0);
                result.add(definitionRepository.save(def));
                log.info("Auto-seeded new agent [{}] for organization [{}]", agent.getAgentCode(), organizationId);
            }
        }
        return result;
    }

    @Transactional
    public AgentExecutionResult delegateTask(UUID organizationId, UUID userId, String agentCode, String taskPrompt, String brandVoice, String language) {
        SpecializedAgent agent = getAgent(agentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Specialized agent not found: " + agentCode));

        AgentContext context = new AgentContext(organizationId, userId, brandVoice, language);
        AgentExecutionResult result = agent.execute(context, taskPrompt);

        // Increment execution counter in DB
        definitionRepository.findByOrganizationIdAndAgentCodeAndDeletedAtIsNull(organizationId, agentCode)
                .ifPresent(def -> {
                    def.setExecutionsCount(def.getExecutionsCount() + 1);
                    definitionRepository.save(def);
                });

        return result;
    }

    @Transactional
    public AgentDefinition toggleAgent(UUID organizationId, String agentCode, boolean enabled) {
        AgentDefinition def = definitionRepository.findByOrganizationIdAndAgentCodeAndDeletedAtIsNull(organizationId, agentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Agent definition not found: " + agentCode));
        def.setEnabled(enabled);
        return definitionRepository.save(def);
    }
}
