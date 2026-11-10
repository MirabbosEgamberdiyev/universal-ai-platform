package com.omniagent;

import com.omniagent.modules.agent.approval.AiApprovalService;
import com.omniagent.modules.ai.provider.AiProvider.AiProviderResult;
import com.omniagent.modules.ai.service.AiProviderRouter;
import com.omniagent.modules.email.domain.Email;
import com.omniagent.modules.email.domain.EmailAccount;
import com.omniagent.modules.email.repository.EmailAccountRepository;
import com.omniagent.modules.email.repository.EmailRepository;
import com.omniagent.modules.email.service.EmailService;
import com.omniagent.modules.productivity.domain.Task;
import com.omniagent.modules.productivity.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class EmailServiceTest {

    private EmailAccountRepository accountRepository;
    private EmailRepository emailRepository;
    private TaskRepository taskRepository;
    private AiProviderRouter aiRouter;
    private AiApprovalService approvalService;
    private EmailService emailService;
    private UUID orgId;
    private UUID accountId;

    @BeforeEach
    void setUp() {
        accountRepository = mock(EmailAccountRepository.class);
        emailRepository = mock(EmailRepository.class);
        taskRepository = mock(TaskRepository.class);
        aiRouter = mock(AiProviderRouter.class);
        approvalService = mock(AiApprovalService.class);

        emailService = new EmailService(
                accountRepository,
                emailRepository,
                taskRepository,
                aiRouter,
                approvalService
        );

        orgId = UUID.randomUUID();
        accountId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should ingest inbound email with AI category triage and summary")
    void testRecordInboundEmail() {
        String triageJson = "{\"category\": \"URGENT\", \"summary\": \"Client requested immediate demo meeting.\"}";
        AiProviderResult mockAiResult = new AiProviderResult(
                true, triageJson, 50, 25, "gemini-1.5-pro", null
        );
        when(aiRouter.generateStructuredJson(anyString(), anyString(), anyString())).thenReturn(mockAiResult);

        when(emailRepository.save(any(Email.class))).thenAnswer(inv -> inv.getArgument(0));

        Email recorded = emailService.recordInboundEmail(
                orgId, accountId, "msg_xyz_1", "ceo@partner.com", "John Doe",
                "team@omniagent.ai", "Partnership Inquiry", "Can we meet tomorrow at 10 AM?", null
        );

        assertNotNull(recorded);
        assertEquals("URGENT", recorded.getCategory());
        assertEquals("Client requested immediate demo meeting.", recorded.getAiSummary());
        assertEquals("INBOUND", recorded.getDirection());
    }

    @Test
    @DisplayName("Should convert email to actionable task with deadline")
    void testConvertEmailToTask() {
        UUID emailId = UUID.randomUUID();
        Email email = new Email();
        email.setId(emailId);
        email.setOrganizationId(orgId);
        email.setSubject("Urgent contract review");
        email.setSenderEmail("legal@corp.com");
        email.setCategory("URGENT");
        email.setAiSummary("Review non-disclosure agreement before Friday.");

        when(emailRepository.findById(emailId)).thenReturn(Optional.of(email));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Task task = emailService.convertEmailToTask(orgId, emailId);

        assertNotNull(task);
        assertTrue(task.getTitle().contains("Urgent contract review"));
        assertEquals("HIGH", task.getPriority());
        assertEquals("TODO", task.getStatus());
        assertNotNull(task.getDueDate());
    }
}
