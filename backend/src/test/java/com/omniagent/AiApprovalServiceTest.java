package com.omniagent;

import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.modules.agent.approval.AiApproval;
import com.omniagent.modules.agent.approval.AiApprovalRepository;
import com.omniagent.modules.agent.approval.AiApprovalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AiApprovalServiceTest {

    private AiApprovalRepository approvalRepository;
    private AiApprovalService approvalService;

    private UUID orgId;
    private UUID executionId;
    private UUID approvalId;
    private UUID reviewerId;

    @BeforeEach
    void setUp() {
        approvalRepository = mock(AiApprovalRepository.class);
        approvalService = new AiApprovalService(approvalRepository);

        orgId = UUID.randomUUID();
        executionId = UUID.randomUUID();
        approvalId = UUID.randomUUID();
        reviewerId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should create pending approval request with 48h expiration window")
    void testCreatePendingApproval() {
        AiApproval mockSaved = new AiApproval();
        mockSaved.setId(approvalId);
        mockSaved.setOrganizationId(orgId);
        mockSaved.setAiExecutionId(executionId);
        mockSaved.setActionType("PUBLISH_MULTI_CHANNEL");
        mockSaved.setPayloadPreview("{\"channels\":[\"telegram\",\"instagram\"]}");
        mockSaved.setStatus("PENDING");
        mockSaved.setExpiresAt(Instant.now().plus(48, ChronoUnit.HOURS));

        when(approvalRepository.save(any(AiApproval.class))).thenReturn(mockSaved);

        AiApproval created = approvalService.createPendingApproval(
                orgId, executionId, "PUBLISH_MULTI_CHANNEL", "{\"channels\":[\"telegram\",\"instagram\"]}"
        );

        assertNotNull(created);
        assertEquals("PENDING", created.getStatus());
        assertEquals("PUBLISH_MULTI_CHANNEL", created.getActionType());
        assertTrue(created.getExpiresAt().isAfter(Instant.now()));
    }

    @Test
    @DisplayName("Should successfully approve pending approval request")
    void testApproveRequest() {
        AiApproval existing = new AiApproval();
        existing.setId(approvalId);
        existing.setOrganizationId(orgId);
        existing.setStatus("PENDING");
        existing.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));

        when(approvalRepository.findById(approvalId)).thenReturn(Optional.of(existing));
        when(approvalRepository.save(any(AiApproval.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AiApproval approved = approvalService.reviewApproval(orgId, approvalId, reviewerId, "APPROVE", null);

        assertEquals("APPROVED", approved.getStatus());
        assertEquals(reviewerId, approved.getReviewedByUserId());
        assertNotNull(approved.getReviewedAt());
        assertNull(approved.getRejectionReason());
    }

    @Test
    @DisplayName("Should successfully reject pending approval request with reason")
    void testRejectRequest() {
        AiApproval existing = new AiApproval();
        existing.setId(approvalId);
        existing.setOrganizationId(orgId);
        existing.setStatus("PENDING");
        existing.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));

        when(approvalRepository.findById(approvalId)).thenReturn(Optional.of(existing));
        when(approvalRepository.save(any(AiApproval.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AiApproval rejected = approvalService.reviewApproval(orgId, approvalId, reviewerId, "REJECT", "Tone does not match brand guidelines");

        assertEquals("REJECTED", rejected.getStatus());
        assertEquals(reviewerId, rejected.getReviewedByUserId());
        assertEquals("Tone does not match brand guidelines", rejected.getRejectionReason());
    }

    @Test
    @DisplayName("Should prevent cross-tenant approval review")
    void testRejectCrossTenantAccess() {
        UUID otherOrgId = UUID.randomUUID();
        AiApproval existing = new AiApproval();
        existing.setId(approvalId);
        existing.setOrganizationId(otherOrgId); // Different org
        existing.setStatus("PENDING");

        when(approvalRepository.findById(approvalId)).thenReturn(Optional.of(existing));

        assertThrows(BusinessRuleException.class, () ->
                approvalService.reviewApproval(orgId, approvalId, reviewerId, "APPROVE", null)
        );
    }
}
