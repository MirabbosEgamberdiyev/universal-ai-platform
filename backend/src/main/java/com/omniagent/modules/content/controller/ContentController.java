package com.omniagent.modules.content.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.content.domain.Content;
import com.omniagent.modules.content.service.ContentService;
import com.omniagent.modules.content.service.ContentService.ContentGenRequest;
import com.omniagent.modules.content.service.ContentService.GeneratedContentResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/content")
public class ContentController {

    private final ContentService contentService;

    public ContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    @GetMapping
    public ResponseEntity<List<Content>> listContent() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(contentService.listContent(orgId));
    }

    @PostMapping
    public ResponseEntity<Content> createDraft(
            Authentication authentication,
            @RequestBody Map<String, Object> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        UUID userId = UUID.fromString(authentication.getName());

        String title = (String) body.get("title");
        String text = (String) body.get("bodyText");
        String locale = (String) body.get("locale");
        List<String> tags = (List<String>) body.get("tags");

        return ResponseEntity.ok(contentService.createDraft(orgId, userId, title, text, locale, tags));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Content> getContent(@PathVariable UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(contentService.getContent(orgId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Content> updateDraft(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        String title = (String) body.get("title");
        String text = (String) body.get("bodyText");
        List<String> tags = (List<String>) body.get("tags");

        return ResponseEntity.ok(contentService.updateDraft(orgId, id, title, text, tags));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDraft(@PathVariable UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        contentService.deleteDraft(orgId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate-ai")
    public ResponseEntity<GeneratedContentResponse> generateAi(@RequestBody ContentGenRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(contentService.generateAiContent(orgId, request));
    }
}
