package com.omniagent.modules.agent.approval;

import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class AiApprovalService {

    private final AiApprovalRepository approvalRepository;

    public AiApprovalService(AiApprovalRepository approvalRepository) {
        this.approvalRepository = approvalRepository;
    }

    @Transactional
    public AiApproval createPendingApproval(UUID orgId, UUID executionId, String actionType, String payloadPreviewJson) {
        AiApproval approval = new AiApproval();
        approval.setOrganizationId(orgId);
        approval.setAiExecutionId(executionId);
        approval.setActionType(actionType);
        approval.setPayloadPreview(payloadPreviewJson);
        approval.setStatus("PENDING");
        approval.setExpiresAt(Instant.now().plus(48, ChronoUnit.HOURS));
        return approvalRepository.save(approval);
    }

    @Transactional(readOnly = true)
    public List<AiApproval> getPendingApprovals(UUID orgId) {
        return approvalRepository.findByOrganizationIdAndStatusOrderByCreatedAtDesc(orgId, "PENDING");
    }

    @Transactional(readOnly = true)
    public List<AiApproval> getAllApprovals(UUID orgId) {
        return approvalRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId);
    }

    @Transactional
    public AiApproval reviewApproval(UUID orgId, UUID approvalId, UUID reviewerUserId, String decision, String rejectionReason) {
        AiApproval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval request not found"));

        if (!approval.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Unauthorized approval access");
        }

        if (!"PENDING".equals(approval.getStatus())) {
            throw new BusinessRuleException("Approval request is already " + approval.getStatus());
        }

        if (Instant.now().isAfter(approval.getExpiresAt())) {
            approval.setStatus("EXPIRED");
            return approvalRepository.save(approval);
        }

        approval.setReviewedByUserId(reviewerUserId);
        approval.setReviewedAt(Instant.now());

        if ("APPROVE".equalsIgnoreCase(decision)) {
            approval.setStatus("APPROVED");
        } else if ("REJECT".equalsIgnoreCase(decision)) {
            approval.setStatus("REJECTED");
            approval.setRejectionReason(rejectionReason);
        } else {
            throw new BusinessRuleException("Invalid decision: " + decision + ". Expected APPROVE or REJECT.");
        }

        return approvalRepository.save(approval);
    }
}
