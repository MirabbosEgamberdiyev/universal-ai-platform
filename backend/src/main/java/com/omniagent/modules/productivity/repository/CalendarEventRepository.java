package com.omniagent.modules.productivity.repository;

import com.omniagent.modules.productivity.domain.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, UUID> {
    List<CalendarEvent> findByOrganizationIdAndUserIdAndStartTimeBetweenOrderByStartTimeAsc(
            UUID organizationId, UUID userId, Instant start, Instant end
    );
}
