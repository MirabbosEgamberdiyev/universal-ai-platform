package com.omniagent.modules.publishing.service;

import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.modules.content.domain.Content;
import com.omniagent.modules.content.domain.ContentAsset;
import com.omniagent.modules.content.repository.ContentAssetRepository;
import com.omniagent.modules.content.repository.ContentRepository;
import com.omniagent.modules.publishing.domain.PublicationJob;
import com.omniagent.modules.publishing.domain.PublicationResult;
import com.omniagent.modules.publishing.repository.PublicationJobRepository;
import com.omniagent.modules.publishing.repository.PublicationResultRepository;
import com.omniagent.modules.social.domain.Channel;
import com.omniagent.modules.social.domain.ConnectedAccount;
import com.omniagent.modules.social.repository.ChannelRepository;
import com.omniagent.modules.social.repository.ConnectedAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class PublicationSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(PublicationSchedulerService.class);

    private final PublicationJobRepository jobRepository;
    private final PublicationResultRepository resultRepository;
    private final ContentRepository contentRepository;
    private final ContentAssetRepository contentAssetRepository;
    private final ChannelRepository channelRepository;
    private final ConnectedAccountRepository accountRepository;
    private final PublicationExecutionEngine executionEngine;

    public PublicationSchedulerService(
            PublicationJobRepository jobRepository,
            PublicationResultRepository resultRepository,
            ContentRepository contentRepository,
            ContentAssetRepository contentAssetRepository,
            ChannelRepository channelRepository,
            ConnectedAccountRepository accountRepository,
            PublicationExecutionEngine executionEngine) {
        this.jobRepository = jobRepository;
        this.resultRepository = resultRepository;
        this.contentRepository = contentRepository;
        this.contentAssetRepository = contentAssetRepository;
        this.channelRepository = channelRepository;
        this.accountRepository = accountRepository;
        this.executionEngine = executionEngine;
    }

    @Transactional
    public List<PublicationJob> schedulePost(UUID orgId, UUID contentId, List<UUID> channelIds, Instant scheduledFor) {
        return schedulePost(orgId, contentId, channelIds, scheduledFor, "UTC");
    }

    @Transactional
    public List<PublicationJob> schedulePost(UUID orgId, UUID contentId, List<UUID> channelIds, Instant scheduledFor, String timezone) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));

        if (!content.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Unauthorized");
        }

        Instant targetTime = scheduledFor != null ? scheduledFor : Instant.now();
        List<PublicationJob> createdJobs = new ArrayList<>();

        for (UUID channelId : channelIds) {
            Channel channel = channelRepository.findById(channelId)
                    .orElseThrow(() -> new ResourceNotFoundException("Channel not found: " + channelId));

            if (!channel.getOrganizationId().equals(orgId)) {
                throw new BusinessRuleException("Channel does not belong to organization");
            }

            PublicationJob job = new PublicationJob();
            job.setOrganizationId(orgId);
            job.setContentId(contentId);
            job.setChannelId(channelId);
            job.setScheduledFor(targetTime);
            job.setSourceTimezone(timezone != null && !timezone.isBlank() ? timezone : "UTC");
            job.setStatus("SCHEDULED");
            createdJobs.add(jobRepository.save(job));
        }

        content.setStatus("SCHEDULED");
        contentRepository.save(content);

        return createdJobs;
    }

    @Transactional
    public List<PublicationJob> quickPublish(UUID orgId, QuickPublishRequest request) {
        if (request.channelIds() == null || request.channelIds().isEmpty()) {
            throw new BusinessRuleException("Kamida bitta kanal yoki akkaunt tanlanishi shart");
        }
        if (request.bodyText() == null || request.bodyText().isBlank()) {
            throw new BusinessRuleException("Post matni bo'sh bo'lishi mumkin emas");
        }

        // 1. Create Content entity
        Content content = new Content();
        content.setOrganizationId(orgId);
        content.setTitle(request.title() != null && !request.title().isBlank()
                ? request.title()
                : (request.bodyText().length() > 50 ? request.bodyText().substring(0, 47) + "..." : request.bodyText()));
        content.setBodyText(request.bodyText().trim());
        content.setStatus(request.publishNow() ? "PROCESSING" : "SCHEDULED");
        content = contentRepository.saveAndFlush(content);

        // 2. Attach Media Assets
        if (request.mediaUrls() != null && !request.mediaUrls().isEmpty()) {
            int order = 0;
            for (String url : request.mediaUrls()) {
                if (url != null && !url.isBlank()) {
                    ContentAsset asset = new ContentAsset();
                    asset.setOrganizationId(orgId);
                    asset.setContentId(content.getId());
                    asset.setStoragePath(url.trim());
                    asset.setAssetType(url.toLowerCase().matches(".*\\.(mp4|mov|avi|webm)$") ? "VIDEO" : "IMAGE");
                    asset.setMimeType(url.toLowerCase().matches(".*\\.(mp4|mov|avi|webm)$") ? "video/mp4" : "image/jpeg");
                    asset.setFileSizeBytes(1024L * 1024L);
                    asset.setSortOrder(order++);
                    contentAssetRepository.saveAndFlush(asset);
                }
            }
        }

        // 3. Create Publication Jobs
        Instant scheduledTime = (request.publishNow() || request.scheduledFor() == null)
                ? Instant.now()
                : request.scheduledFor();

        List<PublicationJob> createdJobs = new ArrayList<>();
        for (UUID channelId : request.channelIds()) {
            Channel channel = channelRepository.findById(channelId)
                    .orElseThrow(() -> new ResourceNotFoundException("Channel not found: " + channelId));

            if (!channel.getOrganizationId().equals(orgId)) {
                throw new BusinessRuleException("Channel does not belong to organization");
            }

            PublicationJob job = new PublicationJob();
            job.setOrganizationId(orgId);
            job.setContentId(content.getId());
            job.setChannelId(channelId);
            job.setScheduledFor(scheduledTime);
            job.setSourceTimezone(request.timezone() != null && !request.timezone().isBlank() ? request.timezone() : "UTC");
            job.setStatus(request.publishNow() ? "PROCESSING" : "SCHEDULED");
            job = jobRepository.saveAndFlush(job);
            createdJobs.add(job);

            // If publish now, execute immediately
            if (request.publishNow()) {
                try {
                    executionEngine.executeJob(job);
                } catch (Exception e) {
                    log.error("Quick publish execution error for channel {}: {}", channel.getTitle(), e.getMessage());
                }
            }
        }

        return createdJobs;
    }

    @Transactional
    public PublicationJob retryJob(UUID orgId, UUID jobId) {
        PublicationJob job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Publication job not found: " + jobId));

        if (!job.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Unauthorized");
        }

        job.setStatus("SCHEDULED");
        job.setScheduledFor(Instant.now());
        job.setErrorMessage(null);
        job = jobRepository.save(job);

        try {
            executionEngine.executeJob(job);
        } catch (Exception e) {
            log.error("Retry execution failed: {}", e.getMessage());
        }

        return job;
    }

    @Transactional(readOnly = true)
    public List<PublicationHistoryItem> getPublicationHistory(UUID orgId) {
        List<PublicationJob> jobs = jobRepository.findByOrganizationIdOrderByScheduledForDesc(orgId);
        List<PublicationHistoryItem> history = new ArrayList<>();

        for (PublicationJob job : jobs) {
            contentRepository.findById(job.getContentId()).ifPresent(content -> {
                channelRepository.findById(job.getChannelId()).ifPresent(channel -> {
                    String platform = "UNKNOWN";
                    if (channel.getConnectedAccountId() != null) {
                        Optional<ConnectedAccount> acc = accountRepository.findById(channel.getConnectedAccountId());
                        if (acc.isPresent()) {
                            platform = acc.get().getPlatform();
                        }
                    }

                    List<ContentAsset> assets = contentAssetRepository.findByContentIdOrderBySortOrderAsc(content.getId());
                    List<String> mediaUrls = assets.stream().map(ContentAsset::getStoragePath).toList();

                    Optional<PublicationResult> res = resultRepository.findFirstByPublicationJobIdOrderByCreatedAtDesc(job.getId());

                    history.add(new PublicationHistoryItem(
                            job.getId(),
                            content.getId(),
                            content.getTitle() != null ? content.getTitle() : "Post",
                            content.getBodyText(),
                            mediaUrls,
                            channel.getId(),
                            channel.getTitle(),
                            platform,
                            job.getStatus(),
                            res.map(PublicationResult::getPlatformPostId).orElse(null),
                            res.map(PublicationResult::getPostUrl).orElse(null),
                            job.getErrorMessage(),
                            job.getScheduledFor(),
                            res.map(PublicationResult::getPublishedAt).orElse(null),
                            job.getSourceTimezone() != null ? job.getSourceTimezone() : "UTC"
                    ));
                });
            });
        }

        return history;
    }

    @Transactional(readOnly = true)
    public List<CalendarPostItem> getCalendarPosts(UUID orgId, Instant start, Instant end) {
        List<PublicationJob> jobs = jobRepository.findByOrganizationIdAndScheduledForBetweenOrderByScheduledForAsc(orgId, start, end);
        List<CalendarPostItem> items = new ArrayList<>();

        for (PublicationJob job : jobs) {
            contentRepository.findById(job.getContentId()).ifPresent(content -> {
                channelRepository.findById(job.getChannelId()).ifPresent(channel -> {
                    Optional<PublicationResult> res = resultRepository.findFirstByPublicationJobIdOrderByCreatedAtDesc(job.getId());
                    items.add(new CalendarPostItem(
                            job.getId(),
                            content.getId(),
                            content.getTitle() != null ? content.getTitle() : "Untitled Post",
                            content.getBodyText(),
                            channel.getId(),
                            channel.getTitle(),
                            channel.getChannelType(),
                            job.getScheduledFor(),
                            job.getStatus(),
                            res.map(PublicationResult::getPostUrl).orElse(null)
                    ));
                });
            });
        }
        return items;
    }

    // Background job dispatcher running every 10 seconds
    @Scheduled(fixedDelay = 10000)
    public void processScheduledQueue() {
        List<PublicationJob> pendingJobs = jobRepository.findByStatusAndScheduledForLessThanEqual("SCHEDULED", Instant.now());
        if (!pendingJobs.isEmpty()) {
            log.info("Processing {} scheduled publication jobs...", pendingJobs.size());
            for (PublicationJob job : pendingJobs) {
                try {
                    executionEngine.executeJob(job);
                } catch (Exception e) {
                    log.error("Failed to process job {}: {}", job.getId(), e.getMessage());
                }
            }
        }
    }

    public record CalendarPostItem(
            UUID jobId,
            UUID contentId,
            String title,
            String bodySnippet,
            UUID channelId,
            String channelTitle,
            String channelType,
            Instant scheduledFor,
            String status,
            String liveUrl
    ) {}

    public record QuickPublishRequest(
            String title,
            String bodyText,
            List<String> mediaUrls,
            List<UUID> channelIds,
            Instant scheduledFor,
            boolean publishNow,
            String timezone
    ) {
        public QuickPublishRequest(String title, String bodyText, List<String> mediaUrls, List<UUID> channelIds, Instant scheduledFor, boolean publishNow) {
            this(title, bodyText, mediaUrls, channelIds, scheduledFor, publishNow, "UTC");
        }
    }

    public record PublicationHistoryItem(
            UUID jobId,
            UUID contentId,
            String title,
            String bodyText,
            List<String> mediaUrls,
            UUID channelId,
            String channelTitle,
            String platform,
            String status,
            String platformPostId,
            String postUrl,
            String errorMessage,
            Instant scheduledFor,
            Instant publishedAt,
            String sourceTimezone
    ) {}
}
