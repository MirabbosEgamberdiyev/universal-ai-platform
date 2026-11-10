package com.omniagent.modules.iam.repository;

import com.omniagent.modules.iam.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByNameAndIsSystemTrue(String name);
    Optional<Role> findByOrganizationIdAndName(UUID organizationId, String name);
}
