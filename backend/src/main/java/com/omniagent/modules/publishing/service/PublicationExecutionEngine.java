package com.omniagent.modules.publishing.service;

import com.omniagent.modules.content.domain.Content;
import com.omniagent.modules.content.domain.ContentAsset;
import com.omniagent.modules.content.repository.ContentAssetRepository;
import com.omniagent.modules.content.repository.ContentRepository;
import com.omniagent.modules.meta.service.MetaAdapter;
import com.omniagent.modules.publishing.domain.PublicationJob;
import com.omniagent.modules.publishing.domain.PublicationResult;
import com.omniagent.modules.publishing.repository.PublicationJobRepository;
import com.omniagent.modules.publishing.repository.PublicationResultRepository;
import com.omniagent.modules.social.adapter.*;
import com.omniagent.modules.social.adapter.SocialPlatformAdapter.PublishPayload;
import com.omniagent.modules.social.adapter.SocialPlatformAdapter.PublishResult;
import com.omniagent.modules.social.domain.Channel;
import com.omniagent.modules.social.domain.ConnectedAccount;
import com.omniagent.modules.social.repository.ChannelRepository;
import com.omniagent.modules.social.repository.ConnectedAccountRepository;
import com.omniagent.modules.social.service.SocialAccountService;
import com.omniagent.modules.telegram.service.TelegramAdapter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class PublicationExecutionEngine {

    private static final Logger log = LoggerFactory.getLogger(PublicationExecutionEngine.class);

    private final PublicationJobRepository jobRepository;
    private final PublicationResultRepository resultRepository;
    private final ContentRepository contentRepository;
    private final ContentAssetRepository contentAssetRepository;
    private final ChannelRepository channelRepository;
    private final ConnectedAccountRepository accountRepository;
    private final SocialAccountService socialAccountService;
    private final TelegramAdapter telegramAdapter;
    private final MetaAdapter metaAdapter;
    private final YouTubeAdapter youTubeAdapter;
    private final TikTokAdapter tikTokAdapter;
    private final LinkedInAdapter linkedInAdapter;

    public PublicationExecutionEngine(
            PublicationJobRepository jobRepository,
            PublicationResultRepository resultRepository,
            ContentRepository contentRepository,
            ContentAssetRepository contentAssetRepository,
            ChannelRepository channelRepository,
            ConnectedAccountRepository accountRepository,
            SocialAccountService socialAccountService,
            TelegramAdapter telegramAdapter,
            MetaAdapter metaAdapter,
            YouTubeAdapter youTubeAdapter,
            TikTokAdapter tikTokAdapter,
            LinkedInAdapter linkedInAdapter) {
        this.jobRepository = jobRepository;
        this.resultRepository = resultRepository;
        this.contentRepository = contentRepository;
        this.contentAssetRepository = contentAssetRepository;
        this.channelRepository = channelRepository;
        this.accountRepository = accountRepository;
        this.socialAccountService = socialAccountService;
        this.telegramAdapter = telegramAdapter;
        this.metaAdapter = metaAdapter;
        this.youTubeAdapter = youTubeAdapter;
        this.tikTokAdapter = tikTokAdapter;
        this.linkedInAdapter = linkedInAdapter;
    }

    @Transactional
    public void executeJob(PublicationJob job) {
        job.setStatus("PROCESSING");
        jobRepository.save(job);

        try {
            Content content = contentRepository.findById(job.getContentId())
                    .orElseThrow(() -> new IllegalStateException("Content not found: " + job.getContentId()));

            Channel channel = channelRepository.findById(job.getChannelId())
                    .orElseThrow(() -> new IllegalStateException("Channel not found: " + job.getChannelId()));

            ConnectedAccount account = accountRepository.findById(channel.getConnectedAccountId())
                    .orElseThrow(() -> new IllegalStateException("Connected account not found"));

            String token = socialAccountService.getDecryptedToken(account.getId());

            SocialPlatformAdapter adapter = resolveAdapter(account.getPlatform());

            List<ContentAsset> assets = contentAssetRepository.findByContentIdOrderBySortOrderAsc(content.getId());
            List<String> mediaUrls = assets.stream().map(ContentAsset::getStoragePath).toList();
            String mediaType = "TEXT";
            if (!assets.isEmpty()) {
                mediaType = assets.get(0).getAssetType();
            }

            PublishPayload payload = new PublishPayload(
                    content.getBodyText(),
                    mediaUrls,
                    mediaType
            );

            log.info("Executing publication job {} for channel {} on platform {}", job.getId(), channel.getTitle(), account.getPlatform());
            PublishResult publishResult = adapter.publishPost(channel, token, payload);

            if (publishResult.success()) {
                job.setStatus("PUBLISHED");
                jobRepository.saveAndFlush(job);

                PublicationResult res = new PublicationResult();
                res.setPublicationJobId(job.getId());
                res.setPlatformPostId(publishResult.platformPostId());
                res.setPostUrl(publishResult.postUrl());
                res.setRawResponse(publishResult.rawResponseJson() != null ? publishResult.rawResponseJson() : "{}");
                res.setPublishedAt(Instant.now());
                resultRepository.saveAndFlush(res);

                log.info("Job {} published successfully! Platform ID: {}", job.getId(), publishResult.platformPostId());
            } else {
                handleFailure(job, publishResult.errorMessage());
            }

            updateAggregatedContentStatus(job.getContentId());

        } catch (Exception e) {
            log.error("Error executing publication job {}: {}", job.getId(), e.getMessage());
            handleFailure(job, e.getMessage());
            updateAggregatedContentStatus(job.getContentId());
        }
    }

    private void updateAggregatedContentStatus(UUID contentId) {
        try {
            Content content = contentRepository.findById(contentId).orElse(null);
            if (content == null) return;

            List<PublicationJob> jobs = jobRepository.findByContentId(contentId);
            if (jobs.isEmpty()) return;

            boolean allPublished = jobs.stream().allMatch(j -> "PUBLISHED".equalsIgnoreCase(j.getStatus()));
            boolean allFailed = jobs.stream().allMatch(j -> "FAILED".equalsIgnoreCase(j.getStatus()));
            boolean anyPublished = jobs.stream().anyMatch(j -> "PUBLISHED".equalsIgnoreCase(j.getStatus()));
            boolean anyPending = jobs.stream().anyMatch(j -> "PROCESSING".equalsIgnoreCase(j.getStatus()) || "RETRYING".equalsIgnoreCase(j.getStatus()) || "SCHEDULED".equalsIgnoreCase(j.getStatus()));

            if (allPublished) {
                content.setStatus("PUBLISHED");
            } else if (allFailed) {
                content.setStatus("FAILED");
            } else if (anyPublished && !anyPending) {
                content.setStatus("PARTIALLY_PUBLISHED");
            } else if (anyPending) {
                content.setStatus("PUBLISHING");
            }
            contentRepository.saveAndFlush(content);
        } catch (Exception ex) {
            log.warn("Failed to update aggregated content status for {}: {}", contentId, ex.getMessage());
        }
    }

    private SocialPlatformAdapter resolveAdapter(String platform) {
        if (platform == null) return metaAdapter;
        return switch (platform.toUpperCase()) {
            case "TELEGRAM" -> telegramAdapter;
            case "YOUTUBE" -> youTubeAdapter;
            case "TIKTOK" -> tikTokAdapter;
            case "LINKEDIN" -> linkedInAdapter;
            default -> metaAdapter; // INSTAGRAM, META, FACEBOOK
        };
    }

    private void handleFailure(PublicationJob job, String errorMessage) {
        job.setRetryCount(job.getRetryCount() + 1);
        job.setErrorMessage(errorMessage);

        if (job.getRetryCount() >= job.getMaxRetries()) {
            job.setStatus("FAILED");
            log.error("Job {} reached max retries and is marked FAILED", job.getId());
        } else {
            job.setStatus("RETRYING");
            // Exponential backoff
            job.setScheduledFor(Instant.now().plusSeconds(60L * job.getRetryCount()));
            log.warn("Job {} failed. Scheduled retry #{} for {}", job.getId(), job.getRetryCount(), job.getScheduledFor());
        }
        jobRepository.save(job);
    }
}
