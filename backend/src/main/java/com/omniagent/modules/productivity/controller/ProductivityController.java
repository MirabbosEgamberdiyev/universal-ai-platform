package com.omniagent.modules.productivity.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.productivity.domain.CalendarEvent;
import com.omniagent.modules.productivity.domain.Task;
import com.omniagent.modules.productivity.service.ProductivityService;
import com.omniagent.modules.productivity.service.ProductivityService.DailyExecutiveBriefing;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/productivity")
public class ProductivityController {

    private final ProductivityService productivityService;

    public ProductivityController(ProductivityService productivityService) {
        this.productivityService = productivityService;
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<Task>> listTasks(Authentication authentication) {
        UUID orgId = TenantContext.getCurrentTenant();
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(productivityService.listTasks(orgId, userId));
    }

    @PostMapping("/tasks")
    public ResponseEntity<Task> createTask(
            Authentication authentication,
            @RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        UUID userId = UUID.fromString(authentication.getName());
        String title = body.get("title");
        String desc = body.get("description");
        String dueStr = body.get("dueDate");
        Instant dueDate = dueStr != null ? Instant.parse(dueStr) : null;
        String priority = body.get("priority");
        return ResponseEntity.ok(productivityService.createTask(orgId, userId, title, desc, dueDate, priority));
    }

    @PatchMapping("/tasks/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        UUID userId = UUID.fromString(authentication.getName());
        String status = body.get("status");
        return ResponseEntity.ok(productivityService.updateTaskStatus(orgId, userId, id, status));
    }

    @GetMapping("/events")
    public ResponseEntity<List<CalendarEvent>> listEvents(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end) {
        UUID orgId = TenantContext.getCurrentTenant();
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(productivityService.listEvents(orgId, userId, start, end));
    }

    @PostMapping("/events")
    public ResponseEntity<CalendarEvent> createEvent(
            Authentication authentication,
            @RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        UUID userId = UUID.fromString(authentication.getName());
        String title = body.get("title");
        String desc = body.get("description");
        Instant start = Instant.parse(body.get("startTime"));
        Instant end = Instant.parse(body.get("endTime"));
        String location = body.get("location");
        return ResponseEntity.ok(productivityService.createCalendarEvent(orgId, userId, title, desc, start, end, location));
    }

    @GetMapping("/briefing")
    public ResponseEntity<DailyExecutiveBriefing> getBriefing(Authentication authentication) {
        UUID orgId = TenantContext.getCurrentTenant();
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(productivityService.getDailyBriefing(orgId, userId));
    }

    @PostMapping("/meetings/agenda")
    public ResponseEntity<ProductivityService.AgendaResult> generateAgenda(
            @RequestBody Map<String, Object> body) {
        String topic = (String) body.getOrDefault("topic", "Executive Alignment");
        int duration = ((Number) body.getOrDefault("durationMinutes", 30)).intValue();
        String participants = (String) body.getOrDefault("participants", "All Core Members");
        return ResponseEntity.ok(productivityService.generateMeetingAgenda(topic, duration, participants));
    }

    @PostMapping("/meetings/summarize")
    public ResponseEntity<ProductivityService.MeetingAnalysisResult> summarizeMeeting(
            Authentication authentication,
            @RequestBody Map<String, Object> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        UUID userId = UUID.fromString(authentication.getName());
        String title = (String) body.getOrDefault("meetingTitle", "Product Strategy Review");
        String transcript = (String) body.getOrDefault("transcript", "");
        boolean autoCreateTasks = Boolean.TRUE.equals(body.get("autoCreateTasks"));
        return ResponseEntity.ok(productivityService.summarizeMeetingTranscript(orgId, userId, title, transcript, autoCreateTasks));
    }
}
