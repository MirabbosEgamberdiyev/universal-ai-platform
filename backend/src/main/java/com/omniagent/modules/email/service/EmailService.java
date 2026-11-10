package com.omniagent.modules.email.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.modules.agent.approval.AiApprovalService;
import com.omniagent.modules.ai.provider.AiProvider.AiProviderResult;
import com.omniagent.modules.ai.service.AiProviderRouter;
import com.omniagent.modules.email.domain.Email;
import com.omniagent.modules.email.domain.EmailAccount;
import com.omniagent.modules.email.repository.EmailAccountRepository;
import com.omniagent.modules.email.repository.EmailRepository;
import com.omniagent.modules.productivity.domain.Task;
import com.omniagent.modules.productivity.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final EmailAccountRepository accountRepository;
    private final EmailRepository emailRepository;
    private final TaskRepository taskRepository;
    private final AiProviderRouter aiRouter;
    private final AiApprovalService approvalService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public EmailService(
            EmailAccountRepository accountRepository,
            EmailRepository emailRepository,
            TaskRepository taskRepository,
            AiProviderRouter aiRouter,
            AiApprovalService approvalService) {
        this.accountRepository = accountRepository;
        this.emailRepository = emailRepository;
        this.taskRepository = taskRepository;
        this.aiRouter = aiRouter;
        this.approvalService = approvalService;
    }

    @Transactional(readOnly = true)
    public List<EmailAccount> listAccounts(UUID orgId) {
        return accountRepository.findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(orgId);
    }

    @Transactional
    public EmailAccount connectAccount(UUID orgId, String provider, String emailAddress, String accountName) {
        return accountRepository.findByOrganizationIdAndEmailAddressAndDeletedAtIsNull(orgId, emailAddress)
                .orElseGet(() -> {
                    EmailAccount acc = new EmailAccount();
                    acc.setOrganizationId(orgId);
                    acc.setProvider(provider.toUpperCase());
                    acc.setEmailAddress(emailAddress);
                    acc.setAccountName(accountName);
                    acc.setActive(true);
                    acc.setSyncStatus("SYNCED");
                    acc.setLastSyncedAt(Instant.now());
                    log.info("Connected email account [{}] for org [{}]", emailAddress, orgId);
                    return accountRepository.save(acc);
                });
    }

    @Transactional(readOnly = true)
    public List<Email> listEmails(UUID orgId, String category) {
        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            return emailRepository.findByOrganizationIdAndCategoryAndDeletedAtIsNullOrderByReceivedAtDesc(orgId, category.toUpperCase());
        }
        return emailRepository.findByOrganizationIdAndDeletedAtIsNullOrderByReceivedAtDesc(orgId);
    }

    @Transactional
    public Email recordInboundEmail(
            UUID orgId,
            UUID accountId,
            String externalId,
            String senderEmail,
            String senderName,
            String recipientEmail,
            String subject,
            String snippet,
            String bodyHtml) {

        Email email = new Email();
        email.setOrganizationId(orgId);
        email.setEmailAccountId(accountId);
        email.setExternalMessageId(externalId);
        email.setSenderEmail(senderEmail);
        email.setSenderName(senderName);
        email.setRecipientEmail(recipientEmail);
        email.setSubject(subject);
        email.setBodySnippet(snippet);
        email.setBodyHtml(bodyHtml);
        email.setDirection("INBOUND");
        email.setStatus("UNREAD");

        // AI Category Triage & Executive Summary
        try {
            String triagePrompt = "Classify email into category (URGENT, LEAD, SUPPORT, NEWSLETTER, GENERAL) and write a 1-sentence executive summary:\n" +
                    "Subject: " + subject + "\nBody: " + snippet;
            String schema = "{\"category\": \"STRING\", \"summary\": \"STRING\"}";
            AiProviderResult triageResult = aiRouter.generateStructuredJson("You are an executive email triage assistant.", triagePrompt, schema);
            JsonNode node = objectMapper.readTree(triageResult.content());
            email.setCategory(node.path("category").asText("GENERAL").toUpperCase());
            email.setAiSummary(node.path("summary").asText(snippet));
        } catch (Exception e) {
            email.setCategory("GENERAL");
            email.setAiSummary(snippet);
        }

        return emailRepository.save(email);
    }

    @Transactional
    public Email generateAiDraftReply(UUID orgId, UUID emailId) {
        Email email = emailRepository.findById(emailId)
                .orElseThrow(() -> new ResourceNotFoundException("Email not found: " + emailId));

        if (!email.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Unauthorized email access");
        }

        String prompt = "Compose a polite, professional reply to the following customer email:\n" +
                "From: " + email.getSenderName() + " <" + email.getSenderEmail() + ">\n" +
                "Subject: " + email.getSubject() + "\n" +
                "Message: " + email.getBodySnippet();

        AiProviderResult result = aiRouter.generateText(
                "You are an executive email correspondent. Keep responses clear, helpful, and concise.", prompt
        );

        email.setAiDraftReply(result.content());
        return emailRepository.save(email);
    }

    @Transactional
    public Task convertEmailToTask(UUID orgId, UUID emailId) {
        Email email = emailRepository.findById(emailId)
                .orElseThrow(() -> new ResourceNotFoundException("Email not found: " + emailId));

        Task task = new Task();
        task.setOrganizationId(orgId);
        task.setTitle("Follow up: " + email.getSubject());
        task.setDescription("From: " + email.getSenderEmail() + "\n\nSummary:\n" + email.getAiSummary());
        task.setPriority("HIGH".equals(email.getCategory()) || "URGENT".equals(email.getCategory()) ? "HIGH" : "MEDIUM");
        task.setStatus("TODO");
        task.setDueDate(Instant.now().plusSeconds(86400 * 2)); // 48h deadline

        log.info("Converted email [{}] to task [{}] for org [{}]", emailId, task.getTitle(), orgId);
        return taskRepository.save(task);
    }

    @Transactional
    public Email sendApprovedEmail(UUID orgId, UUID emailId, String replyBody) {
        Email email = emailRepository.findById(emailId)
                .orElseThrow(() -> new ResourceNotFoundException("Email not found: " + emailId));

        Email outbound = new Email();
        outbound.setOrganizationId(orgId);
        outbound.setEmailAccountId(email.getEmailAccountId());
        outbound.setThreadId(email.getThreadId());
        outbound.setSenderEmail(email.getRecipientEmail());
        outbound.setRecipientEmail(email.getSenderEmail());
        outbound.setSubject("Re: " + email.getSubject());
        outbound.setBodySnippet(replyBody);
        outbound.setBodyHtml("<p>" + replyBody.replace("\n", "<br>") + "</p>");
        outbound.setDirection("OUTBOUND");
        outbound.setStatus("SENT");
        outbound.setReceivedAt(Instant.now());

        email.setStatus("READ");
        emailRepository.save(email);

        log.info("Outbound email dispatched to [{}] for org [{}]", email.getSenderEmail(), orgId);
        return emailRepository.save(outbound);
    }
}
