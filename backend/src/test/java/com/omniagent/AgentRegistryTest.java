package com.omniagent;

import com.omniagent.modules.agents.domain.AgentDefinition;
import com.omniagent.modules.agents.repository.AgentDefinitionRepository;
import com.omniagent.modules.agents.service.AgentRegistry;
import com.omniagent.modules.agents.service.SpecializedAgent;
import com.omniagent.modules.agents.service.SpecializedAgent.AgentContext;
import com.omniagent.modules.agents.service.SpecializedAgent.AgentExecutionResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AgentRegistryTest {

    private AgentDefinitionRepository definitionRepository;
    private SpecializedAgent mockAgent;
    private AgentRegistry agentRegistry;
    private UUID orgId;

    @BeforeEach
    void setUp() {
        definitionRepository = mock(AgentDefinitionRepository.class);
        mockAgent = mock(SpecializedAgent.class);
        when(mockAgent.getAgentCode()).thenReturn("RESEARCH");
        when(mockAgent.getName()).thenReturn("Research Agent");
        when(mockAgent.getDomain()).thenReturn("Research");
        when(mockAgent.getDefaultSystemPrompt()).thenReturn("You are the Research Agent.");
        when(mockAgent.getAllowedTools()).thenReturn(List.of("search_web", "extract_facts"));

        agentRegistry = new AgentRegistry(List.of(mockAgent), definitionRepository);
        orgId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should retrieve registered specialized agent by code")
    void testGetAgentByCode() {
        Optional<SpecializedAgent> agent = agentRegistry.getAgent("RESEARCH");
        assertTrue(agent.isPresent());
        assertEquals("RESEARCH", agent.get().getAgentCode());
        assertEquals("Research Agent", agent.get().getName());
    }

    @Test
    @DisplayName("Should seed agent definitions when organization has none")
    void testSeedOrganizationAgents() {
        when(definitionRepository.findByOrganizationIdAndDeletedAtIsNullOrderByNameAsc(orgId))
                .thenReturn(List.of());

        AgentDefinition savedDef = new AgentDefinition();
        savedDef.setAgentCode("RESEARCH");
        savedDef.setName("Research Agent");
        savedDef.setEnabled(true);
        when(definitionRepository.save(any(AgentDefinition.class))).thenReturn(savedDef);

        List<AgentDefinition> seeded = agentRegistry.getOrSeedOrganizationAgents(orgId);

        assertEquals(1, seeded.size());
        assertEquals("RESEARCH", seeded.get(0).getAgentCode());
        verify(definitionRepository, times(1)).save(any(AgentDefinition.class));
    }

    @Test
    @DisplayName("Should delegate task to specialized agent and increment execution count")
    void testDelegateTask() {
        AgentExecutionResult mockResult = AgentExecutionResult.successful(
                "RESEARCH", "Found 3 competitor analysis reports.", List.of("search_web"), 150
        );
        when(mockAgent.execute(any(AgentContext.class), anyString())).thenReturn(mockResult);

        AgentDefinition def = new AgentDefinition();
        def.setAgentCode("RESEARCH");
        def.setExecutionsCount(5);
        when(definitionRepository.findByOrganizationIdAndAgentCodeAndDeletedAtIsNull(orgId, "RESEARCH"))
                .thenReturn(Optional.of(def));

        AgentExecutionResult result = agentRegistry.delegateTask(
                orgId, UUID.randomUUID(), "RESEARCH", "Find competitors in Central Asia", "Professional", "en"
        );

        assertNotNull(result);
        assertTrue(result.success());
        assertEquals("Found 3 competitor analysis reports.", result.outputText());
        assertEquals(6, def.getExecutionsCount());
        verify(definitionRepository).save(def);
    }
}
