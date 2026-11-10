package com.omniagent.modules.agents.service;

import com.omniagent.modules.ai.service.AiProviderRouter;
import org.springframework.stereotype.Component;

import java.util.List;

// 1. Personal Assistant Agent
@Component
class PersonalAssistantAgent extends BaseSpecializedAgent {
    public PersonalAssistantAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "PERSONAL_ASSISTANT"; }
    public String getName() { return "Personal Assistant Agent"; }
    public String getDomain() { return "Executive Productivity"; }
    public String getDescription() { return "Central coordinator for triaging requests, daily agenda briefings, and delegation."; }
    public String getDefaultSystemPrompt() { return "You are the Personal Assistant Agent. You coordinate daily priorities, extract action items, and organize executive schedules."; }
    public List<String> getAllowedTools() { return List.of("search_context", "delegate_task", "create_reminder"); }
    public boolean requiresMode3Approval() { return false; }
}

// 2. Research Agent
@Component
class ResearchAgent extends BaseSpecializedAgent {
    public ResearchAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "RESEARCH"; }
    public String getName() { return "Research & Intelligence Agent"; }
    public String getDomain() { return "Market & Factual Research"; }
    public String getDescription() { return "Gathers verified industry facts, competitor data, and technical documentation."; }
    public String getDefaultSystemPrompt() { return "You are the Research Agent. You synthesize factual, evidence-backed summaries with explicit citations."; }
    public List<String> getAllowedTools() { return List.of("search_web", "extract_facts", "query_knowledge_base"); }
    public boolean requiresMode3Approval() { return false; }
}

// 3. Planning Agent
@Component
class PlanningAgent extends BaseSpecializedAgent {
    public PlanningAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "PLANNING"; }
    public String getName() { return "Planning & Strategy Agent"; }
    public String getDomain() { return "Strategic Roadmaps"; }
    public String getDescription() { return "Decomposes complex multi-week goals into directed acyclic graph (DAG) execution steps."; }
    public String getDefaultSystemPrompt() { return "You are the Planning Agent. You break down complex goals into sequential and parallel milestones with time estimates."; }
    public List<String> getAllowedTools() { return List.of("build_dag_plan", "estimate_resources"); }
    public boolean requiresMode3Approval() { return false; }
}

// 4. Social Media Agent
@Component
class SocialMediaAgent extends BaseSpecializedAgent {
    public SocialMediaAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "SOCIAL_MEDIA"; }
    public String getName() { return "Social Media Operations Agent"; }
    public String getDomain() { return "Omnichannel Social Media"; }
    public String getDescription() { return "Dispatches posts, manages broadcast channels, and verifies publication receipts across Telegram, Meta, and LinkedIn."; }
    public String getDefaultSystemPrompt() { return "You are the Social Media Operations Agent. You manage official social network distribution with strict platform formatting."; }
    public List<String> getAllowedTools() { return List.of("post_telegram", "publish_instagram", "schedule_post"); }
    public boolean requiresMode3Approval() { return true; } // Mandatory Mode 3 approval
}

// 5. Content Creation Agent
@Component
class ContentCreationAgent extends BaseSpecializedAgent {
    public ContentCreationAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "CONTENT_CREATION"; }
    public String getName() { return "Content Creation Agent"; }
    public String getDomain() { return "Creative Studio"; }
    public String getDescription() { return "Crafts viral captions, hooks, hashtags, and multilingual marketing copy."; }
    public String getDefaultSystemPrompt() { return "You are the Content Creation Agent. You write engaging, high-converting social media copy tailored per channel."; }
    public List<String> getAllowedTools() { return List.of("generate_copy", "suggest_hashtags", "format_preview"); }
    public boolean requiresMode3Approval() { return false; }
}

// 6. Marketing Agent
@Component
class MarketingAgent extends BaseSpecializedAgent {
    public MarketingAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "MARKETING"; }
    public String getName() { return "Marketing Campaign Agent"; }
    public String getDomain() { return "Growth & Performance"; }
    public String getDescription() { return "Designs end-to-end promotional campaigns and customer segmentation strategies."; }
    public String getDefaultSystemPrompt() { return "You are the Marketing Campaign Agent. You analyze target customer segments and design ROI-driven campaigns."; }
    public List<String> getAllowedTools() { return List.of("analyze_audience", "create_campaign_brief"); }
    public boolean requiresMode3Approval() { return false; }
}

// 7. Customer Support Agent
@Component
class CustomerSupportAgent extends BaseSpecializedAgent {
    public CustomerSupportAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "CUSTOMER_SUPPORT"; }
    public String getName() { return "Customer Support Agent"; }
    public String getDomain() { return "Unified Inbox & Helpdesk"; }
    public String getDescription() { return "Resolves customer inquiries, drafts replies, and handles escalation within 24h Meta windows."; }
    public String getDefaultSystemPrompt() { return "You are the Customer Support Agent. You deliver empathetic, accurate, and prompt customer answers."; }
    public List<String> getAllowedTools() { return List.of("draft_inbox_reply", "detect_sentiment"); }
    public boolean requiresMode3Approval() { return true; }
}

// 8. CRM Agent
@Component
class CrmAgent extends BaseSpecializedAgent {
    public CrmAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "CRM"; }
    public String getName() { return "CRM & Pipeline Agent"; }
    public String getDomain() { return "Sales & Pipeline Management"; }
    public String getDescription() { return "Scores incoming leads, manages deal stages, and schedules follow-up calls."; }
    public String getDefaultSystemPrompt() { return "You are the CRM Agent. You track customer deals through the sales pipeline from Lead to Won."; }
    public List<String> getAllowedTools() { return List.of("create_lead", "update_deal_stage", "log_activity"); }
    public boolean requiresMode3Approval() { return false; }
}

// 9. Analytics Agent
@Component
class AnalyticsAgent extends BaseSpecializedAgent {
    public AnalyticsAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "ANALYTICS"; }
    public String getName() { return "Analytics & Reporting Agent"; }
    public String getDomain() { return "Social & Business Analytics"; }
    public String getDescription() { return "Computes engagement rates, audience growth trajectory, and platform KPI reports."; }
    public String getDefaultSystemPrompt() { return "You are the Analytics Agent. You compute and present accurate statistical metrics without fabricating data."; }
    public List<String> getAllowedTools() { return List.of("calculate_kpi", "aggregate_reach", "export_csv"); }
    public boolean requiresMode3Approval() { return false; }
}

// 10. Business Intelligence Agent
@Component
class BusinessIntelligenceAgent extends BaseSpecializedAgent {
    public BusinessIntelligenceAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "BUSINESS_INTELLIGENCE"; }
    public String getName() { return "Business Intelligence Agent"; }
    public String getDomain() { return "Predictive Intelligence"; }
    public String getDescription() { return "Discovers anomalies, models revenue trajectories, and predicts customer churn."; }
    public String getDefaultSystemPrompt() { return "You are the Business Intelligence Agent. You model trends and identify strategic opportunities."; }
    public List<String> getAllowedTools() { return List.of("forecast_growth", "detect_anomalies"); }
    public boolean requiresMode3Approval() { return false; }
}

// 11. Email Agent
@Component
class EmailAgent extends BaseSpecializedAgent {
    public EmailAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "EMAIL"; }
    public String getName() { return "Email Management Agent"; }
    public String getDomain() { return "Email Operations"; }
    public String getDescription() { return "Processes inbound Gmail/Outlook threads, categorizes urgency, and prepares drafts."; }
    public String getDefaultSystemPrompt() { return "You are the Email Agent. You summarize long threads and compose professional responses."; }
    public List<String> getAllowedTools() { return List.of("fetch_emails", "draft_email_reply", "send_email"); }
    public boolean requiresMode3Approval() { return true; } // Email dispatch requires approval
}

// 12. Calendar Agent
@Component
class CalendarAgent extends BaseSpecializedAgent {
    public CalendarAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "CALENDAR"; }
    public String getName() { return "Calendar & Scheduling Agent"; }
    public String getDomain() { return "Calendar Operations"; }
    public String getDescription() { return "Resolves scheduling conflicts, detects meeting intent, and prepares calendar invites."; }
    public String getDefaultSystemPrompt() { return "You are the Calendar Agent. You detect meeting availability and book calendar appointments without overlaps."; }
    public List<String> getAllowedTools() { return List.of("check_availability", "book_meeting", "update_event"); }
    public boolean requiresMode3Approval() { return true; }
}

// 13. Document Agent
@Component
class DocumentAgent extends BaseSpecializedAgent {
    public DocumentAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "DOCUMENT"; }
    public String getName() { return "Document Intelligence Agent"; }
    public String getDomain() { return "Document AI & Extraction"; }
    public String getDescription() { return "Parses PDF, DOCX, and XLSX files, extracts tabular data, and summarizes documents."; }
    public String getDefaultSystemPrompt() { return "You are the Document Intelligence Agent. You parse complex documents and extract structured facts."; }
    public List<String> getAllowedTools() { return List.of("parse_document", "extract_table", "summarize_file"); }
    public boolean requiresMode3Approval() { return false; }
}

// 14. Automation Agent
@Component
class AutomationAgent extends BaseSpecializedAgent {
    public AutomationAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "AUTOMATION"; }
    public String getName() { return "Workflow Automation Agent"; }
    public String getDomain() { return "No-Code Workflow Engine"; }
    public String getDescription() { return "Executes multi-step trigger-action pipelines, retries failed webhooks, and evaluates business rules."; }
    public String getDefaultSystemPrompt() { return "You are the Automation Agent. You evaluate triggers and safely execute connected workflow actions."; }
    public List<String> getAllowedTools() { return List.of("execute_workflow", "invoke_webhook", "evaluate_rule"); }
    public boolean requiresMode3Approval() { return true; }
}

// 15. Finance Assistant Agent
@Component
class FinanceAssistantAgent extends BaseSpecializedAgent {
    public FinanceAssistantAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "FINANCE"; }
    public String getName() { return "Finance & Budgeting Agent"; }
    public String getDomain() { return "Financial Management"; }
    public String getDescription() { return "Monitors API spending caps, calculates cost estimates, and formats quotes."; }
    public String getDefaultSystemPrompt() { return "You are the Finance Agent. You enforce spending budgets and compute financial projections with strict arithmetic."; }
    public List<String> getAllowedTools() { return List.of("calculate_spend", "check_budget_cap", "generate_quote"); }
    public boolean requiresMode3Approval() { return true; }
}

// 16. Project Management Agent
@Component
class ProjectManagementAgent extends BaseSpecializedAgent {
    public ProjectManagementAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "PROJECT_MANAGEMENT"; }
    public String getName() { return "Project Management Agent"; }
    public String getDomain() { return "Tasks & Sprint Delivery"; }
    public String getDescription() { return "Assigns tasks, tracks sprint velocity, and flags approaching deadlines."; }
    public String getDefaultSystemPrompt() { return "You are the Project Management Agent. You keep teams aligned on deadlines, sprint backlog, and deliverables."; }
    public List<String> getAllowedTools() { return List.of("create_task", "assign_member", "update_milestone"); }
    public boolean requiresMode3Approval() { return false; }
}

// 17. Knowledge Management Agent
@Component
class KnowledgeManagementAgent extends BaseSpecializedAgent {
    public KnowledgeManagementAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "KNOWLEDGE_MANAGEMENT"; }
    public String getName() { return "Knowledge Management Agent"; }
    public String getDomain() { return "RAG & Vector Knowledge"; }
    public String getDescription() { return "Performs semantic vector searches over company knowledge bases and returns verified citations."; }
    public String getDefaultSystemPrompt() { return "You are the Knowledge Management Agent. You retrieve verified organizational knowledge and provide source citations."; }
    public List<String> getAllowedTools() { return List.of("semantic_search", "index_article", "cite_source"); }
    public boolean requiresMode3Approval() { return false; }
}

// 18. Security & Policy Agent
@Component
class SecurityPolicyAgent extends BaseSpecializedAgent {
    public SecurityPolicyAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "SECURITY_POLICY"; }
    public String getName() { return "Security & Policy Agent"; }
    public String getDomain() { return "Enterprise Zero-Trust Security"; }
    public String getDescription() { return "Scans inputs for prompt injections, validates OAuth token scopes, and enforces organizational data boundaries."; }
    public String getDefaultSystemPrompt() { return "You are the Security & Policy Agent. You inspect requests for prompt injection, sensitive data leaks, and policy compliance."; }
    public List<String> getAllowedTools() { return List.of("scan_prompt_injection", "verify_scope", "rotate_token"); }
    public boolean requiresMode3Approval() { return false; }
}

// 19. Browser Research Agent
@Component
class BrowserResearchAgent extends BaseSpecializedAgent {
    public BrowserResearchAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "BROWSER_RESEARCH"; }
    public String getName() { return "Browser Research Agent"; }
    public String getDomain() { return "Live Web Intelligence"; }
    public String getDescription() { return "Performs structured web extractions, searches live internet domains, and captures factual web snapshots."; }
    public String getDefaultSystemPrompt() { return "You are the Browser Research Agent. You explore web pages, extract factual claims with exact URLs, and synthesize web findings."; }
    public List<String> getAllowedTools() { return List.of("browser_search", "scrape_page", "extract_structured_table"); }
    public boolean requiresMode3Approval() { return false; }
}

// 20. Translation Agent
@Component
class TranslationAgent extends BaseSpecializedAgent {
    public TranslationAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "TRANSLATION"; }
    public String getName() { return "Translation & Localization Agent"; }
    public String getDomain() { return "Multilingual Localization"; }
    public String getDescription() { return "Provides idiomatic translations across Uzbek (Latin & Cyrillic), Russian, English, Persian, and Arabic with cultural adaptation."; }
    public String getDefaultSystemPrompt() { return "You are the Translation & Localization Agent. You provide nuanced, culturally accurate translations without literal idioms, maintaining formatting and tone."; }
    public List<String> getAllowedTools() { return List.of("translate_text", "detect_language", "localize_formatting"); }
    public boolean requiresMode3Approval() { return false; }
}

// 21. Meeting Assistant Agent
@Component
class MeetingAssistantAgent extends BaseSpecializedAgent {
    public MeetingAssistantAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "MEETING_ASSISTANT"; }
    public String getName() { return "Meeting Assistant Agent"; }
    public String getDomain() { return "Meeting Intelligence"; }
    public String getDescription() { return "Generates structured agendas, summarizes transcripts, extracts key decisions, and maps follow-up action items."; }
    public String getDefaultSystemPrompt() { return "You are the Meeting Assistant Agent. You synthesize meetings into Executive Summary, Key Decisions, and Action Items with owners and due dates."; }
    public List<String> getAllowedTools() { return List.of("generate_agenda", "summarize_transcript", "extract_action_items"); }
    public boolean requiresMode3Approval() { return false; }
}

// 22. Master Orchestrator Agent
@Component
class MasterOrchestratorAgent extends BaseSpecializedAgent {
    public MasterOrchestratorAgent(AiProviderRouter aiRouter) { super(aiRouter); }
    public String getAgentCode() { return "MASTER_ORCHESTRATOR"; }
    public String getName() { return "Master Orchestrator Agent"; }
    public String getDomain() { return "Multi-Agent Coordination"; }
    public String getDescription() { return "Decomposes global multi-agent objectives into parallel sub-tasks and synthesizes cross-agent results."; }
    public String getDefaultSystemPrompt() { return "You are the Master Orchestrator Agent. You plan complex cross-domain workflows, assign tasks to specialized agents, and verify output quality."; }
    public List<String> getAllowedTools() { return List.of("decompose_intent", "route_to_specialist", "verify_execution_dag"); }
    public boolean requiresMode3Approval() { return false; }
}
