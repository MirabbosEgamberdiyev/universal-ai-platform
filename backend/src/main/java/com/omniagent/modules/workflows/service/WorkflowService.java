package com.omniagent.modules.workflows.service;

import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.modules.workflows.domain.Workflow;
import com.omniagent.modules.workflows.domain.WorkflowExecution;
import com.omniagent.modules.workflows.domain.WorkflowVersion;
import com.omniagent.modules.workflows.repository.WorkflowExecutionRepository;
import com.omniagent.modules.workflows.repository.WorkflowRepository;
import com.omniagent.modules.workflows.repository.WorkflowVersionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowVersionRepository versionRepository;
    private final WorkflowExecutionRepository executionRepository;

    public WorkflowService(
            WorkflowRepository workflowRepository,
            WorkflowVersionRepository versionRepository,
            WorkflowExecutionRepository executionRepository) {
        this.workflowRepository = workflowRepository;
        this.versionRepository = versionRepository;
        this.executionRepository = executionRepository;
    }

    @Transactional
    public Workflow createWorkflow(UUID orgId, String name, String description, String initialGraphJson) {
        Workflow workflow = new Workflow();
        workflow.setOrganizationId(orgId);
        workflow.setName(name);
        workflow.setDescription(description);
        workflow.setActive(true);
        workflow = workflowRepository.save(workflow);

        WorkflowVersion version = new WorkflowVersion();
        version.setWorkflowId(workflow.getId());
        version.setVersionNumber(1);
        version.setGraphDefinition(initialGraphJson != null ? initialGraphJson : "{\"nodes\":[],\"edges\":[]}");
        versionRepository.save(version);

        return workflow;
    }

    @Transactional(readOnly = true)
    public List<Workflow> listWorkflows(UUID orgId) {
        return workflowRepository.findByOrganizationIdAndDeletedAtIsNull(orgId);
    }

    @Transactional
    public WorkflowVersion publishNewVersion(UUID orgId, UUID workflowId, String graphDefinitionJson) {
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found"));

        if (!workflow.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Unauthorized");
        }

        int latestVersion = versionRepository.findFirstByWorkflowIdOrderByVersionNumberDesc(workflowId)
                .map(WorkflowVersion::getVersionNumber)
                .orElse(0);

        WorkflowVersion version = new WorkflowVersion();
        version.setWorkflowId(workflowId);
        version.setVersionNumber(latestVersion + 1);
        version.setGraphDefinition(graphDefinitionJson);
        return versionRepository.save(version);
    }

    @Transactional
    public WorkflowExecution triggerWorkflow(UUID orgId, UUID workflowId, String triggerType, String triggerPayloadJson) {
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found"));

        if (!workflow.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Unauthorized");
        }

        WorkflowVersion latestVersion = versionRepository.findFirstByWorkflowIdOrderByVersionNumberDesc(workflowId)
                .orElseThrow(() -> new BusinessRuleException("Workflow has no published versions"));

        WorkflowExecution execution = new WorkflowExecution();
        execution.setOrganizationId(orgId);
        execution.setWorkflowVersionId(latestVersion.getId());
        execution.setTriggerType(triggerType);
        execution.setTriggerPayload(triggerPayloadJson != null ? triggerPayloadJson : "{}");
        execution.setExecutionState("{\"currentStep\":\"TRIGGER\",\"logs\":[\"Workflow triggered via " + triggerType + "\"]}");
        execution.setStatus("COMPLETED");
        execution.setFinishedAt(Instant.now());

        return executionRepository.save(execution);
    }

    @Transactional(readOnly = true)
    public List<WorkflowExecution> getExecutionHistory(UUID orgId) {
        return executionRepository.findByOrganizationIdOrderByStartedAtDesc(orgId);
    }

    @Transactional
    public Workflow toggleActive(UUID orgId, UUID workflowId) {
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found"));
        if (!workflow.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Unauthorized");
        }
        workflow.setActive(!workflow.getActive());
        return workflowRepository.save(workflow);
    }
}
