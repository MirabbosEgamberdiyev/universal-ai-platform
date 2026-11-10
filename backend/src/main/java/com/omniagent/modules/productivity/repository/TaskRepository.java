package com.omniagent.modules.productivity.repository;

import com.omniagent.modules.productivity.domain.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByOrganizationIdAndUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID organizationId, UUID userId);
    List<Task> findByOrganizationIdAndUserIdAndStatusAndDeletedAtIsNull(UUID organizationId, UUID userId, String status);
}
