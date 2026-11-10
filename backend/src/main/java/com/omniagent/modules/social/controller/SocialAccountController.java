package com.omniagent.modules.social.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.social.domain.Channel;
import com.omniagent.modules.social.domain.ConnectedAccount;
import com.omniagent.modules.social.service.SocialAccountService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/accounts")
public class SocialAccountController {

    private final SocialAccountService socialAccountService;

    public SocialAccountController(SocialAccountService socialAccountService) {
        this.socialAccountService = socialAccountService;
    }

    @GetMapping
    public ResponseEntity<List<ConnectedAccount>> listAccounts() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(socialAccountService.getConnectedAccounts(orgId));
    }

    @GetMapping("/channels")
    public ResponseEntity<List<Channel>> listChannels() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(socialAccountService.getChannels(orgId));
    }

    @PostMapping("/telegram/connect")
    public ResponseEntity<ConnectedAccount> connectTelegram(@RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        String botToken = body.get("botToken");
        return ResponseEntity.ok(socialAccountService.connectTelegramBot(orgId, botToken));
    }

    @PostMapping("/telegram/add-channel")
    public ResponseEntity<Channel> addTelegramChannel(@RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        UUID accountId = UUID.fromString(body.get("accountId"));
        String channelChatId = body.get("channelChatId");
        String title = body.get("title");
        String type = body.get("channelType");
        return ResponseEntity.ok(socialAccountService.addTelegramChannel(orgId, accountId, channelChatId, title, type));
    }

    @PostMapping("/meta/connect")
    public ResponseEntity<ConnectedAccount> connectMeta(@RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        String platformAccountId = body.get("platformAccountId");
        String accountName = body.get("accountName");
        String accessToken = body.get("accessToken");
        if (platformAccountId == null || platformAccountId.isBlank() || accessToken == null || accessToken.isBlank()) {
            throw new com.omniagent.common.exception.BusinessRuleException("platformAccountId and accessToken are required to connect Meta/Instagram");
        }
        return ResponseEntity.ok(socialAccountService.connectMetaAccount(orgId, platformAccountId, accountName, accessToken));
    }

    @PostMapping("/youtube/connect")
    public ResponseEntity<ConnectedAccount> connectYouTube(@RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        String channelId = body.get("channelId");
        String title = body.getOrDefault("title", "My YouTube Channel");
        String accessToken = body.get("accessToken");
        if (channelId == null || channelId.isBlank() || accessToken == null || accessToken.isBlank()) {
            throw new com.omniagent.common.exception.BusinessRuleException("channelId and accessToken are required to connect YouTube");
        }
        return ResponseEntity.ok(socialAccountService.connectYouTubeAccount(orgId, channelId, title, accessToken));
    }

    @DeleteMapping("/{accountId}")
    public ResponseEntity<Void> disconnectAccount(@PathVariable UUID accountId) {
        UUID orgId = TenantContext.getCurrentTenant();
        socialAccountService.disconnectAccount(orgId, accountId);
        return ResponseEntity.noContent().build();
    }
}
