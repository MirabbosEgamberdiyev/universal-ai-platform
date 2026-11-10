package com.omniagent.modules.content.repository;

import com.omniagent.modules.content.domain.ContentAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContentAssetRepository extends JpaRepository<ContentAsset, UUID> {
    List<ContentAsset> findByContentIdOrderBySortOrderAsc(UUID contentId);
    List<ContentAsset> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
    List<ContentAsset> findByOrganizationIdAndAssetTypeOrderByCreatedAtDesc(UUID organizationId, String assetType);
}
