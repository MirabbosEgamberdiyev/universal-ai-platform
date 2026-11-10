package com.omniagent.modules.inbox.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.inbox.domain.Conversation;
import com.omniagent.modules.inbox.domain.Message;
import com.omniagent.modules.inbox.service.InboxService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inbox")
public class InboxController {

    private final InboxService inboxService;

    public InboxController(InboxService inboxService) {
        this.inboxService = inboxService;
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<Conversation>> listConversations() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(inboxService.listConversations(orgId));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(inboxService.getConversationMessages(orgId, id));
    }

    @PostMapping("/conversations/{id}/suggest-reply")
    public ResponseEntity<Map<String, String>> suggestReply(@PathVariable UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        String suggested = inboxService.generateSuggestedReply(orgId, id);
        return ResponseEntity.ok(Map.of("suggestedReply", suggested));
    }

    @PostMapping("/conversations/{id}/reply")
    public ResponseEntity<Message> sendReply(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        UUID userId = UUID.fromString(authentication.getName());
        String text = body.get("replyText");
        return ResponseEntity.ok(inboxService.sendReply(orgId, userId, id, text));
    }
}
