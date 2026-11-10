package com.omniagent.modules.social.service;

import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.modules.meta.service.MetaAdapter;
import com.omniagent.modules.social.adapter.SocialPlatformAdapter;
import com.omniagent.modules.social.domain.Channel;
import com.omniagent.modules.social.domain.ConnectedAccount;
import com.omniagent.modules.social.domain.OAuthCredential;
import com.omniagent.modules.social.repository.ChannelRepository;
import com.omniagent.modules.social.repository.ConnectedAccountRepository;
import com.omniagent.modules.social.repository.OAuthCredentialRepository;
import com.omniagent.modules.telegram.service.TelegramAdapter;
import com.omniagent.modules.vault.service.TokenVaultService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class SocialAccountService {

    private final ConnectedAccountRepository accountRepository;
    private final OAuthCredentialRepository credentialRepository;
    private final ChannelRepository channelRepository;
    private final TokenVaultService tokenVaultService;
    private final TelegramAdapter telegramAdapter;
    private final MetaAdapter metaAdapter;

    public SocialAccountService(
            ConnectedAccountRepository accountRepository,
            OAuthCredentialRepository credentialRepository,
            ChannelRepository channelRepository,
            TokenVaultService tokenVaultService,
            TelegramAdapter telegramAdapter,
            MetaAdapter metaAdapter) {
        this.accountRepository = accountRepository;
        this.credentialRepository = credentialRepository;
        this.channelRepository = channelRepository;
        this.tokenVaultService = tokenVaultService;
        this.telegramAdapter = telegramAdapter;
        this.metaAdapter = metaAdapter;
    }

    @Transactional
    public ConnectedAccount connectTelegramBot(UUID orgId, String botToken) {
        TelegramAdapter.BotInfo botInfo = telegramAdapter.getBotInfo(botToken);
        if (!botInfo.valid()) {
            throw new BusinessRuleException("Invalid Telegram Bot Token. Verification with @BotFather failed.");
        }

        ConnectedAccount account = accountRepository
                .findByOrganizationIdAndPlatformAndPlatformAccountId(orgId, "TELEGRAM", botInfo.id())
                .orElseGet(ConnectedAccount::new);

        account.setOrganizationId(orgId);
        account.setPlatform("TELEGRAM");
        account.setPlatformAccountId(botInfo.id());
        account.setAccountName(botInfo.firstName());
        account.setUsername(botInfo.username());
        account.setAccountType("BOT");
        account.setStatus("CONNECTED");
        account = accountRepository.save(account);

        // Store encrypted token in Vault
        OAuthCredential credential = credentialRepository.findByConnectedAccountId(account.getId())
                .orElseGet(OAuthCredential::new);

        TokenVaultService.EncryptedPayload encrypted = tokenVaultService.encrypt(botToken);
        credential.setConnectedAccountId(account.getId());
        credential.setKeyId(encrypted.keyId());
        credential.setEncryptedAccessToken(encrypted.ciphertext());
        credential.setTokenType("Bot");
        credential.setScopes("[\"bot\"]");
        credential.setLastRefreshedAt(Instant.now());
        credentialRepository.save(credential);

        return account;
    }

    @Transactional
    public Channel addTelegramChannel(UUID orgId, UUID accountId, String channelChatId, String title, String type) {
        ConnectedAccount account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Connected account not found"));

        if (!account.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Account does not belong to this organization");
        }

        Channel channel = channelRepository.findByOrganizationIdAndExternalChannelId(orgId, channelChatId)
                .orElseGet(Channel::new);

        channel.setOrganizationId(orgId);
        channel.setConnectedAccountId(account.getId());
        channel.setExternalChannelId(channelChatId);
        channel.setTitle(title);
        channel.setChannelType(type != null ? type : "TG_CHANNEL");
        channel.setActive(true);

        return channelRepository.save(channel);
    }

    @Transactional
    public ConnectedAccount connectMetaAccount(UUID orgId, String platformAccountId, String accountName, String accessToken) {
        ConnectedAccount account = accountRepository
                .findByOrganizationIdAndPlatformAndPlatformAccountId(orgId, "META", platformAccountId)
                .orElseGet(ConnectedAccount::new);

        account.setOrganizationId(orgId);
        account.setPlatform("META");
        account.setPlatformAccountId(platformAccountId);
        account.setAccountName(accountName);
        account.setAccountType("BUSINESS");
        account.setStatus("CONNECTED");
        account = accountRepository.save(account);

        TokenVaultService.EncryptedPayload encrypted = tokenVaultService.encrypt(accessToken);
        OAuthCredential credential = credentialRepository.findByConnectedAccountId(account.getId())
                .orElseGet(OAuthCredential::new);

        credential.setConnectedAccountId(account.getId());
        credential.setKeyId(encrypted.keyId());
        credential.setEncryptedAccessToken(encrypted.ciphertext());
        credential.setTokenType("Bearer");
        credential.setLastRefreshedAt(Instant.now());
        credentialRepository.save(credential);

        // Auto-discover Pages and Instagram Accounts
        List<SocialPlatformAdapter.DiscoveredChannel> discovered = metaAdapter.fetchChannels(accessToken);
        for (SocialPlatformAdapter.DiscoveredChannel dc : discovered) {
            Channel ch = channelRepository.findByOrganizationIdAndExternalChannelId(orgId, dc.externalId())
                    .orElseGet(Channel::new);
            ch.setOrganizationId(orgId);
            ch.setConnectedAccountId(account.getId());
            ch.setExternalChannelId(dc.externalId());
            ch.setTitle(dc.title());
            ch.setChannelType(dc.channelType());
            ch.setActive(true);
            channelRepository.save(ch);
        }

        return account;
    }

    @Transactional
    public ConnectedAccount connectYouTubeAccount(UUID orgId, String channelId, String channelTitle, String accessToken) {
        ConnectedAccount account = accountRepository
                .findByOrganizationIdAndPlatformAndPlatformAccountId(orgId, "YOUTUBE", channelId)
                .orElseGet(ConnectedAccount::new);

        account.setOrganizationId(orgId);
        account.setPlatform("YOUTUBE");
        account.setPlatformAccountId(channelId);
        account.setAccountName(channelTitle != null ? channelTitle : "YouTube Channel");
        account.setAccountType("CREATOR");
        account.setStatus("CONNECTED");
        account = accountRepository.save(account);

        TokenVaultService.EncryptedPayload encrypted = tokenVaultService.encrypt(accessToken);
        OAuthCredential credential = credentialRepository.findByConnectedAccountId(account.getId())
                .orElseGet(OAuthCredential::new);

        credential.setConnectedAccountId(account.getId());
        credential.setKeyId(encrypted.keyId());
        credential.setEncryptedAccessToken(encrypted.ciphertext());
        credential.setTokenType("Bearer");
        credential.setLastRefreshedAt(Instant.now());
        credentialRepository.save(credential);

        Channel ch = channelRepository.findByOrganizationIdAndExternalChannelId(orgId, channelId)
                .orElseGet(Channel::new);
        ch.setOrganizationId(orgId);
        ch.setConnectedAccountId(account.getId());
        ch.setExternalChannelId(channelId);
        ch.setTitle(channelTitle != null ? channelTitle : "YouTube Channel");
        ch.setChannelType("YOUTUBE_CHANNEL");
        ch.setActive(true);
        channelRepository.save(ch);

        return account;
    }

    @Transactional(readOnly = true)
    public List<ConnectedAccount> getConnectedAccounts(UUID orgId) {
        return accountRepository.findByOrganizationIdAndDeletedAtIsNull(orgId);
    }

    @Transactional(readOnly = true)
    public List<Channel> getChannels(UUID orgId) {
        return channelRepository.findByOrganizationIdAndDeletedAtIsNull(orgId);
    }

    @Transactional(readOnly = true)
    public String getDecryptedToken(UUID accountId) {
        OAuthCredential cred = credentialRepository.findByConnectedAccountId(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Credentials not found for account"));
        return tokenVaultService.decrypt(cred.getEncryptedAccessToken());
    }

    @Transactional
    public void disconnectAccount(UUID orgId, UUID accountId) {
        ConnectedAccount account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (!account.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Unauthorized");
        }

        account.setStatus("REVOKED");
        account.setDeletedAt(Instant.now());
        accountRepository.save(account);

        List<Channel> channels = channelRepository.findByConnectedAccountId(accountId);
        for (Channel ch : channels) {
            ch.setActive(false);
            ch.setDeletedAt(Instant.now());
            channelRepository.save(ch);
        }
    }
}
