package com.omniagent.modules.email.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.email.domain.Email;
import com.omniagent.modules.email.domain.EmailAccount;
import com.omniagent.modules.email.service.EmailService;
import com.omniagent.modules.productivity.domain.Task;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/emails")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<EmailAccount>> listAccounts() {
        UUID orgId = TenantContext.getOrganizationId();
        return ResponseEntity.ok(emailService.listAccounts(orgId));
    }

    @PostMapping("/accounts")
    public ResponseEntity<EmailAccount> connectAccount(@RequestBody Map<String, String> request) {
        UUID orgId = TenantContext.getOrganizationId();
        String provider = request.getOrDefault("provider", "GMAIL");
        String emailAddress = request.get("emailAddress");
        String accountName = request.getOrDefault("accountName", emailAddress);

        EmailAccount account = emailService.connectAccount(orgId, provider, emailAddress, accountName);
        return ResponseEntity.ok(account);
    }

    @GetMapping
    public ResponseEntity<List<Email>> listEmails(@RequestParam(required = false) String category) {
        UUID orgId = TenantContext.getOrganizationId();
        return ResponseEntity.ok(emailService.listEmails(orgId, category));
    }

    @PostMapping("/{id}/draft")
    public ResponseEntity<Email> generateAiDraft(@PathVariable UUID id) {
        UUID orgId = TenantContext.getOrganizationId();
        return ResponseEntity.ok(emailService.generateAiDraftReply(orgId, id));
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<Email> sendApprovedEmail(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        UUID orgId = TenantContext.getOrganizationId();
        String replyBody = request.getOrDefault("replyBody", "");
        return ResponseEntity.ok(emailService.sendApprovedEmail(orgId, id, replyBody));
    }

    @PostMapping("/{id}/to-task")
    public ResponseEntity<Task> convertToTask(@PathVariable UUID id) {
        UUID orgId = TenantContext.getOrganizationId();
        return ResponseEntity.ok(emailService.convertEmailToTask(orgId, id));
    }
}
