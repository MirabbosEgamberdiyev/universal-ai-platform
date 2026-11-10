package com.omniagent.modules.crm.repository;

import com.omniagent.modules.crm.domain.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID> {
    List<Contact> findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID organizationId);
    List<Contact> findByOrganizationIdAndStageAndDeletedAtIsNull(UUID organizationId, String stage);
}
