package com.omniagent;

import com.omniagent.modules.content.domain.Content;
import com.omniagent.modules.content.repository.ContentAssetRepository;
import com.omniagent.modules.content.repository.ContentRepository;
import com.omniagent.modules.meta.service.MetaAdapter;
import com.omniagent.modules.publishing.domain.PublicationJob;
import com.omniagent.modules.publishing.domain.PublicationResult;
import com.omniagent.modules.publishing.repository.PublicationJobRepository;
import com.omniagent.modules.publishing.repository.PublicationResultRepository;
import com.omniagent.modules.social.adapter.SocialPlatformAdapter.PublishPayload;
import com.omniagent.modules.social.adapter.SocialPlatformAdapter.PublishResult;
import com.omniagent.modules.social.adapter.YouTubeAdapter;
import com.omniagent.modules.social.adapter.TikTokAdapter;
import com.omniagent.modules.social.adapter.LinkedInAdapter;
import com.omniagent.modules.social.domain.Channel;
import com.omniagent.modules.social.domain.ConnectedAccount;
import com.omniagent.modules.social.repository.ChannelRepository;
import com.omniagent.modules.social.repository.ConnectedAccountRepository;
import com.omniagent.modules.social.service.SocialAccountService;
import com.omniagent.modules.publishing.service.PublicationExecutionEngine;
import com.omniagent.modules.telegram.service.TelegramAdapter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class PublicationExecutionEngineTest {

    private PublicationJobRepository jobRepository;
    private PublicationResultRepository resultRepository;
    private ContentRepository contentRepository;
    private ContentAssetRepository contentAssetRepository;
    private ChannelRepository channelRepository;
    private ConnectedAccountRepository accountRepository;
    private SocialAccountService socialAccountService;
    private TelegramAdapter telegramAdapter;
    private MetaAdapter metaAdapter;
    private YouTubeAdapter youTubeAdapter;
    private TikTokAdapter tikTokAdapter;
    private LinkedInAdapter linkedInAdapter;
    private PublicationExecutionEngine executionEngine;

    private UUID contentId;
    private UUID channelId;
    private UUID accountId;
    private PublicationJob testJob;
    private Content testContent;
    private Channel testChannel;
    private ConnectedAccount testAccount;

    @BeforeEach
    void setUp() {
        jobRepository = mock(PublicationJobRepository.class);
        resultRepository = mock(PublicationResultRepository.class);
        contentRepository = mock(ContentRepository.class);
        contentAssetRepository = mock(ContentAssetRepository.class);
        channelRepository = mock(ChannelRepository.class);
        accountRepository = mock(ConnectedAccountRepository.class);
        socialAccountService = mock(SocialAccountService.class);
        telegramAdapter = mock(TelegramAdapter.class);
        metaAdapter = mock(MetaAdapter.class);
        youTubeAdapter = mock(YouTubeAdapter.class);
        tikTokAdapter = mock(TikTokAdapter.class);
        linkedInAdapter = mock(LinkedInAdapter.class);

        executionEngine = new PublicationExecutionEngine(
                jobRepository,
                resultRepository,
                contentRepository,
                contentAssetRepository,
                channelRepository,
                accountRepository,
                socialAccountService,
                telegramAdapter,
                metaAdapter,
                youTubeAdapter,
                tikTokAdapter,
                linkedInAdapter
        );

        contentId = UUID.randomUUID();
        channelId = UUID.randomUUID();
        accountId = UUID.randomUUID();

        testJob = new PublicationJob();
        testJob.setId(UUID.randomUUID());
        testJob.setContentId(contentId);
        testJob.setChannelId(channelId);
        testJob.setStatus("SCHEDULED");
        testJob.setRetryCount(0);
        testJob.setMaxRetries(3);

        testContent = new Content();
        testContent.setId(contentId);
        testContent.setTitle("Product Launch Announcement");
        testContent.setBodyText("NovaSphere AI v1.0 is now officially live! 🚀");
        testContent.setStatus("APPROVED");

        testChannel = new Channel();
        testChannel.setId(channelId);
        testChannel.setConnectedAccountId(accountId);
        testChannel.setExternalChannelId("-1001234567890");
        testChannel.setTitle("Tech Updates Official");

        testAccount = new ConnectedAccount();
        testAccount.setId(accountId);
        testAccount.setPlatform("TELEGRAM");
        testAccount.setUsername("TechNewsBot");
        testAccount.setAccountName("Tech News Official Bot");

        when(contentRepository.findById(contentId)).thenReturn(Optional.of(testContent));
        when(contentAssetRepository.findByContentIdOrderBySortOrderAsc(contentId)).thenReturn(Collections.emptyList());
        when(channelRepository.findById(channelId)).thenReturn(Optional.of(testChannel));
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(socialAccountService.getDecryptedToken(accountId)).thenReturn("bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11");
        when(jobRepository.findByContentId(contentId)).thenReturn(Collections.singletonList(testJob));
    }

    @Test
    @DisplayName("Should successfully publish post to Telegram and record verified platform receipt")
    void testSuccessfulTelegramPublication() {
        PublishResult mockSuccessResult = new PublishResult(
                true,
                "msg_994821",
                "https://t.me/tech_updates/994821",
                "{\"ok\":true,\"result\":{\"message_id\":994821}}",
                null
        );

        when(telegramAdapter.publishPost(eq(testChannel), anyString(), any(PublishPayload.class)))
                .thenReturn(mockSuccessResult);

        executionEngine.executeJob(testJob);

        assertEquals("PUBLISHED", testJob.getStatus());
        assertEquals("PUBLISHED", testContent.getStatus());

        ArgumentCaptor<PublicationResult> resultCaptor = ArgumentCaptor.forClass(PublicationResult.class);
        verify(resultRepository, times(1)).saveAndFlush(resultCaptor.capture());

        PublicationResult capturedResult = resultCaptor.getValue();
        assertEquals(testJob.getId(), capturedResult.getPublicationJobId());
        assertEquals("msg_994821", capturedResult.getPlatformPostId());
        assertEquals("https://t.me/tech_updates/994821", capturedResult.getPostUrl());
    }

    @Test
    @DisplayName("Should handle transient API error and schedule retry with exponential backoff")
    void testTransientFailureTriggersRetrying() {
        PublishResult mockFailureResult = new PublishResult(
                false,
                null,
                null,
                null,
                "Telegram API 429: Too Many Requests (retry after 30s)"
        );

        when(telegramAdapter.publishPost(eq(testChannel), anyString(), any(PublishPayload.class)))
                .thenReturn(mockFailureResult);

        executionEngine.executeJob(testJob);

        assertEquals("RETRYING", testJob.getStatus());
        assertEquals(1, testJob.getRetryCount());
        assertEquals("Telegram API 429: Too Many Requests (retry after 30s)", testJob.getErrorMessage());
        assertNotNull(testJob.getScheduledFor());
        verify(resultRepository, never()).save(any(PublicationResult.class));
    }

    @Test
    @DisplayName("Should mark job as FAILED when retry limit is exhausted")
    void testMaxRetriesExhaustedMarksFailed() {
        testJob.setRetryCount(2); // One attempt left before reaching maxRetries (3)

        PublishResult mockFailureResult = new PublishResult(
                false,
                null,
                null,
                null,
                "403 Forbidden: Bot was blocked by the channel administrator"
        );

        when(telegramAdapter.publishPost(eq(testChannel), anyString(), any(PublishPayload.class)))
                .thenReturn(mockFailureResult);

        executionEngine.executeJob(testJob);

        assertEquals("FAILED", testJob.getStatus());
        assertEquals(3, testJob.getRetryCount());
        assertEquals("403 Forbidden: Bot was blocked by the channel administrator", testJob.getErrorMessage());
    }

    @Test
    @DisplayName("Should aggregate multi-destination status to PARTIALLY_PUBLISHED when one succeeds and one fails")
    void testPartiallyPublishedAggregation() {
        PublicationJob secondJob = new PublicationJob();
        secondJob.setId(UUID.randomUUID());
        secondJob.setContentId(contentId);
        secondJob.setStatus("FAILED");

        testJob.setStatus("PUBLISHED");
        when(jobRepository.findByContentId(contentId)).thenReturn(java.util.List.of(testJob, secondJob));

        PublishResult mockSuccessResult = new PublishResult(true, "msg_123", "https://t.me/c/123", "{}", null);
        when(telegramAdapter.publishPost(eq(testChannel), anyString(), any(PublishPayload.class))).thenReturn(mockSuccessResult);

        executionEngine.executeJob(testJob);

        assertEquals("PARTIALLY_PUBLISHED", testContent.getStatus());
    }
}
