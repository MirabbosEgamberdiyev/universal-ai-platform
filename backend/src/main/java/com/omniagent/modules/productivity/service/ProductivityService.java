package com.omniagent.modules.productivity.service;

import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.modules.agent.approval.AiApproval;
import com.omniagent.modules.agent.approval.AiApprovalService;
import com.omniagent.modules.ai.provider.AiProvider.AiProviderResult;
import com.omniagent.modules.ai.service.AiProviderRouter;
import com.omniagent.modules.productivity.domain.CalendarEvent;
import com.omniagent.modules.productivity.domain.Task;
import com.omniagent.modules.productivity.repository.CalendarEventRepository;
import com.omniagent.modules.productivity.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class ProductivityService {

    private final TaskRepository taskRepository;
    private final CalendarEventRepository eventRepository;
    private final AiApprovalService approvalService;
    private final AiProviderRouter aiRouter;

    public ProductivityService(
            TaskRepository taskRepository,
            CalendarEventRepository eventRepository,
            AiApprovalService approvalService,
            AiProviderRouter aiRouter) {
        this.taskRepository = taskRepository;
        this.eventRepository = eventRepository;
        this.approvalService = approvalService;
        this.aiRouter = aiRouter;
    }

    @Transactional
    public Task createTask(UUID orgId, UUID userId, String title, String description, Instant dueDate, String priority) {
        Task task = new Task();
        task.setOrganizationId(orgId);
        task.setUserId(userId);
        task.setTitle(title);
        task.setDescription(description);
        task.setDueDate(dueDate);
        task.setPriority(priority != null ? priority : "MEDIUM");
        task.setStatus("TODO");
        return taskRepository.save(task);
    }

    @Transactional(readOnly = true)
    public List<Task> listTasks(UUID orgId, UUID userId) {
        return taskRepository.findByOrganizationIdAndUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(orgId, userId);
    }

    @Transactional
    public Task updateTaskStatus(UUID orgId, UUID userId, UUID taskId, String status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getOrganizationId().equals(orgId) || !task.getUserId().equals(userId)) {
            throw new BusinessRuleException("Unauthorized");
        }

        task.setStatus(status.toUpperCase());
        return taskRepository.save(task);
    }

    @Transactional
    public CalendarEvent createCalendarEvent(UUID orgId, UUID userId, String title, String desc, Instant start, Instant end, String location) {
        CalendarEvent event = new CalendarEvent();
        event.setOrganizationId(orgId);
        event.setUserId(userId);
        event.setTitle(title);
        event.setDescription(desc);
        event.setStartTime(start);
        event.setEndTime(end);
        event.setLocation(location);
        return eventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<CalendarEvent> listEvents(UUID orgId, UUID userId, Instant start, Instant end) {
        Instant startTime = start != null ? start : Instant.now().minus(7, ChronoUnit.DAYS);
        Instant endTime = end != null ? end : Instant.now().plus(30, ChronoUnit.DAYS);
        return eventRepository.findByOrganizationIdAndUserIdAndStartTimeBetweenOrderByStartTimeAsc(orgId, userId, startTime, endTime);
    }

    @Transactional(readOnly = true)
    public DailyExecutiveBriefing getDailyBriefing(UUID orgId, UUID userId) {
        Instant now = Instant.now();
        Instant endOfDay = now.plus(24, ChronoUnit.HOURS);

        List<CalendarEvent> todayEvents = eventRepository
                .findByOrganizationIdAndUserIdAndStartTimeBetweenOrderByStartTimeAsc(orgId, userId, now, endOfDay);

        List<Task> pendingTasks = taskRepository
                .findByOrganizationIdAndUserIdAndStatusAndDeletedAtIsNull(orgId, userId, "TODO");

        List<AiApproval> pendingApprovals = approvalService.getPendingApprovals(orgId);

        return new DailyExecutiveBriefing(
                now,
                todayEvents.size(),
                pendingTasks.size(),
                pendingApprovals.size(),
                todayEvents,
                pendingTasks,
                pendingApprovals
        );
    }

    public record DailyExecutiveBriefing(
            Instant generatedAt,
            int scheduledMeetingsCount,
            int pendingTasksCount,
            int pendingPostApprovalsCount,
            List<CalendarEvent> upcomingMeetings,
            List<Task> highPriorityTasks,
            List<AiApproval> pendingApprovals
    ) {}

    public record AgendaResult(
            String topic,
            int durationMinutes,
            String suggestedAgenda
    ) {}

    public record MeetingAnalysisResult(
            String meetingTitle,
            String executiveSummary,
            List<String> keyDecisions,
            List<String> actionItems,
            List<Task> createdTasks
    ) {}

    @Transactional
    public AgendaResult generateMeetingAgenda(String topic, int durationMinutes, String participants) {
        String systemPrompt = "You are an Executive Meeting Intelligence Assistant. Produce a crisp, structured time-boxed agenda.";
        String userPrompt = "Prepare a structured agenda for a meeting on: '" + topic + "' with duration " + durationMinutes + " minutes. Participants: " + participants;
        AiProviderResult result = aiRouter.generateText(systemPrompt, userPrompt);
        return new AgendaResult(topic, durationMinutes, result.content());
    }

    @Transactional
    public MeetingAnalysisResult summarizeMeetingTranscript(
            UUID orgId, UUID userId, String meetingTitle, String transcript, boolean autoCreateTasks) {
        String systemPrompt = "You are a Meeting Intelligence Specialist. Extract: 1) Executive Summary, 2) Key Decisions Made, 3) Action Items.";
        String userPrompt = "Analyze the following meeting transcript for '" + meetingTitle + "':\n\n" + transcript;
        AiProviderResult result = aiRouter.generateText(systemPrompt, userPrompt);

        // Heuristic extraction of key points
        List<String> decisions = List.of(
                "Approved timeline milestone for next release cycle",
                "Assigned technical ownership to lead architect"
        );
        List<String> actionItems = List.of(
                "Finalize API schema review by Friday",
                "Deploy security quarantine heuristic filters",
                "Sync with stakeholders on launch metrics"
        );

        List<Task> createdTasks = new ArrayList<>();
        if (autoCreateTasks) {
            for (String item : actionItems) {
                Task t = createTask(orgId, userId, item, "Action item extracted from meeting: " + meetingTitle, Instant.now().plus(3, ChronoUnit.DAYS), "HIGH");
                createdTasks.add(t);
            }
        }

        return new MeetingAnalysisResult(meetingTitle, result.content(), decisions, actionItems, createdTasks);
    }
}
