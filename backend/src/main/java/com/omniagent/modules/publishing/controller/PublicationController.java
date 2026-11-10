package com.omniagent.modules.publishing.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.publishing.domain.PublicationJob;
import com.omniagent.modules.publishing.service.PublicationSchedulerService;
import com.omniagent.modules.publishing.service.PublicationSchedulerService.CalendarPostItem;
import com.omniagent.modules.publishing.service.PublicationSchedulerService.PublicationHistoryItem;
import com.omniagent.modules.publishing.service.PublicationSchedulerService.QuickPublishRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/publications")
public class PublicationController {

    private final PublicationSchedulerService schedulerService;

    public PublicationController(PublicationSchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @PostMapping("/quick-publish")
    public ResponseEntity<List<PublicationJob>> quickPublish(@RequestBody QuickPublishRequest request) {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(schedulerService.quickPublish(orgId, request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<PublicationHistoryItem>> getPublicationHistory() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(schedulerService.getPublicationHistory(orgId));
    }

    @PostMapping("/retry/{jobId}")
    public ResponseEntity<PublicationJob> retryJob(@PathVariable UUID jobId) {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(schedulerService.retryJob(orgId, jobId));
    }

    @PostMapping("/schedule")
    public ResponseEntity<List<PublicationJob>> schedulePost(@RequestBody Map<String, Object> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        UUID contentId = UUID.fromString((String) body.get("contentId"));

        List<String> channelStrList = (List<String>) body.get("channelIds");
        List<UUID> channelIds = channelStrList.stream().map(UUID::fromString).toList();

        String scheduledStr = (String) body.get("scheduledFor");
        Instant scheduledFor = scheduledStr != null ? Instant.parse(scheduledStr) : Instant.now();
        String timezone = (String) body.getOrDefault("timezone", "UTC");

        return ResponseEntity.ok(schedulerService.schedulePost(orgId, contentId, channelIds, scheduledFor, timezone));
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<CalendarPostItem>> getCalendarFeed(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end) {
        UUID orgId = TenantContext.getCurrentTenant();
        Instant startTime = start != null ? start : Instant.now().minus(30, ChronoUnit.DAYS);
        Instant endTime = end != null ? end : Instant.now().plus(60, ChronoUnit.DAYS);

        return ResponseEntity.ok(schedulerService.getCalendarPosts(orgId, startTime, endTime));
    }
}
