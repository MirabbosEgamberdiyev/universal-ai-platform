package com.omniagent.modules.crm.repository;

import com.omniagent.modules.crm.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);
}
