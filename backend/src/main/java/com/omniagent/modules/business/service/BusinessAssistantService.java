package com.omniagent.modules.business.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.omniagent.modules.ai.provider.AiProvider.AiProviderResult;
import com.omniagent.modules.ai.service.AiProviderRouter;
import com.omniagent.modules.business.domain.BusinessPlan;
import com.omniagent.modules.business.repository.BusinessPlanRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class BusinessAssistantService {

    private static final Logger log = LoggerFactory.getLogger(BusinessAssistantService.class);

    private final BusinessPlanRepository planRepository;
    private final AiProviderRouter aiRouter;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public BusinessAssistantService(BusinessPlanRepository planRepository, AiProviderRouter aiRouter) {
        this.planRepository = planRepository;
        this.aiRouter = aiRouter;
    }

    @Transactional(readOnly = true)
    public List<BusinessPlan> listPlans(UUID orgId) {
        return planRepository.findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(orgId);
    }

    @Transactional
    public BusinessPlan generateMarketResearch(UUID orgId, String industry, String competitors, String geo) {
        log.info("Generating market research for org [{}] on industry [{}]", orgId, industry);

        String prompt = "Conduct an in-depth market research analysis for:\n" +
                "Industry: " + industry + "\n" +
                "Key Competitors: " + competitors + "\n" +
                "Target Region: " + geo + "\n\n" +
                "Provide market size estimate, competitor strengths/weaknesses, growth drivers, and strategic opportunities.";

        AiProviderResult result = aiRouter.generateText(
                "You are an enterprise management consultant and senior market researcher.", prompt
        );

        BusinessPlan plan = new BusinessPlan();
        plan.setOrganizationId(orgId);
        plan.setTitle("Market Research: " + industry + " (" + geo + ")");
        plan.setPlanType("MARKET_RESEARCH");
        plan.setTargetIndustry(industry);
        plan.setStatus("COMPLETED");

        try {
            Map<String, Object> contentMap = Map.of(
                    "industry", industry,
                    "competitors", competitors,
                    "region", geo,
                    "analysisReport", result.content()
            );
            plan.setContentJson(objectMapper.writeValueAsString(contentMap));
        } catch (Exception e) {
            plan.setContentJson("{\"analysisReport\": \"" + result.content().replace("\"", "\\\"") + "\"}");
        }

        return planRepository.save(plan);
    }

    @Transactional
    public BusinessPlan generateCommercialProposal(UUID orgId, String clientName, String scope, String budget) {
        log.info("Generating commercial proposal for client [{}]", clientName);

        String prompt = "Draft an executive commercial proposal for:\n" +
                "Client: " + clientName + "\n" +
                "Project Scope: " + scope + "\n" +
                "Budget/Terms: " + budget + "\n\n" +
                "Include executive summary, deliverables, timeline milestones, pricing breakdown, and terms of service.";

        AiProviderResult result = aiRouter.generateText(
                "You are a commercial business strategist. Draft polished, compelling enterprise proposals.", prompt
        );

        BusinessPlan proposal = new BusinessPlan();
        proposal.setOrganizationId(orgId);
        proposal.setTitle("Proposal for " + clientName);
        proposal.setPlanType("PROPOSAL");
        proposal.setStatus("COMPLETED");

        try {
            Map<String, Object> contentMap = Map.of(
                    "clientName", clientName,
                    "scope", scope,
                    "budget", budget,
                    "proposalText", result.content()
            );
            proposal.setContentJson(objectMapper.writeValueAsString(contentMap));
        } catch (Exception e) {
            proposal.setContentJson("{\"proposalText\": \"" + result.content().replace("\"", "\\\"") + "\"}");
        }

        return planRepository.save(proposal);
    }
}
