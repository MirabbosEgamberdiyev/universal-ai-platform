package com.omniagent.modules.audit.service;

import com.omniagent.modules.audit.domain.AuditLog;
import com.omniagent.modules.audit.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void record(UUID orgId, UUID userId, String action, String entityType, UUID entityId, String changeDiffJson) {
        AuditLog log = new AuditLog();
        log.setOrganizationId(orgId);
        log.setUserId(userId);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setChangeDiff(changeDiffJson != null ? changeDiffJson : "{}");
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> listLogs(UUID orgId) {
        return auditLogRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId);
    }
}
