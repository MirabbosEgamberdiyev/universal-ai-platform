package com.omniagent.modules.media.service;

import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.common.util.MimeTypeValidator;
import com.omniagent.modules.content.domain.ContentAsset;
import com.omniagent.modules.content.repository.ContentAssetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class MediaService {

    private static final Logger log = LoggerFactory.getLogger(MediaService.class);
    private static final Path STORAGE_DIR = Paths.get("storage", "media");

    private final ContentAssetRepository assetRepository;

    public MediaService(ContentAssetRepository assetRepository) {
        this.assetRepository = assetRepository;
        try {
            Files.createDirectories(STORAGE_DIR);
        } catch (IOException e) {
            log.error("Failed to initialize media storage directory", e);
        }
    }

    @Transactional(readOnly = true)
    public List<ContentAsset> listMedia(UUID orgId, String filterType) {
        if (filterType != null && !filterType.isBlank() && !filterType.equalsIgnoreCase("ALL")) {
            return assetRepository.findByOrganizationIdAndAssetTypeOrderByCreatedAtDesc(orgId, filterType.toUpperCase());
        }
        return assetRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId);
    }

    @Transactional
    public ContentAsset uploadMedia(UUID orgId, MultipartFile file, String tags) {
        if (file == null || file.isEmpty()) {
            throw new BusinessRuleException("Yuklash uchun fayl tanlanmagan");
        }

        try {
            byte[] fileBytes = file.getBytes();
            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_media";
            
            // Enterprise MIME Magic Byte Inspection
            String validatedMime = MimeTypeValidator.validateAndNormalize(fileBytes, originalFilename, file.getContentType());
            String assetType = MimeTypeValidator.isVideo(validatedMime) ? "VIDEO" : "IMAGE";

            // Sanitize filename & generate local storage path
            String sanitizedFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
            String storageFileName = UUID.randomUUID() + "_" + sanitizedFilename;
            Path targetPath = STORAGE_DIR.resolve(storageFileName);
            Files.write(targetPath, fileBytes);

            // Extract dimensions if image
            Integer width = null;
            Integer height = null;
            if (MimeTypeValidator.isImage(validatedMime)) {
                try {
                    BufferedImage img = ImageIO.read(new ByteArrayInputStream(fileBytes));
                    if (img != null) {
                        width = img.getWidth();
                        height = img.getHeight();
                    }
                } catch (Exception e) {
                    log.warn("Failed to extract image dimensions for {}: {}", originalFilename, e.getMessage());
                }
            }

            ContentAsset asset = new ContentAsset();
            asset.setOrganizationId(orgId);
            asset.setOriginalFilename(originalFilename);
            asset.setStoragePath(targetPath.toAbsolutePath().toString());
            asset.setFileUrl("/api/v1/media/" + asset.getId() + "/raw");
            asset.setMimeType(validatedMime);
            asset.setAssetType(assetType);
            asset.setFileSizeBytes((long) fileBytes.length);
            asset.setWidth(width);
            asset.setHeight(height);
            asset.setTags(tags != null ? tags : "");
            asset.setSortOrder(0);

            ContentAsset saved = assetRepository.save(asset);
            saved.setFileUrl("/api/v1/media/" + saved.getId() + "/raw");
            return assetRepository.save(saved);

        } catch (IOException e) {
            log.error("Failed to read and store file", e);
            throw new BusinessRuleException("Faylni saqlashda xatolik yuz berdi: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteMedia(UUID orgId, UUID assetId) {
        ContentAsset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Media fayl topilmadi"));

        if (!asset.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Ruxsat berilmagan amal: Bu fayl tashkilotingizga tegishli emas");
        }

        // Delete from filesystem
        if (asset.getStoragePath() != null) {
            try {
                Path path = Paths.get(asset.getStoragePath());
                Files.deleteIfExists(path);
            } catch (IOException e) {
                log.warn("Could not delete physical file at {}: {}", asset.getStoragePath(), e.getMessage());
            }
        }

        assetRepository.delete(asset);
    }

    @Transactional(readOnly = true)
    public byte[] getMediaRawBytes(UUID orgId, UUID assetId) {
        ContentAsset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Media fayl topilmadi"));

        if (!asset.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Ruxsat berilmagan amal");
        }

        try {
            Path path = Paths.get(asset.getStoragePath());
            if (Files.exists(path)) {
                return Files.readAllBytes(path);
            }
        } catch (IOException e) {
            log.error("Failed to read media file: {}", asset.getStoragePath(), e);
        }

        throw new ResourceNotFoundException("Fayl server diskida topilmadi");
    }

    @Transactional(readOnly = true)
    public ContentAsset getMediaAsset(UUID orgId, UUID assetId) {
        ContentAsset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Media fayl topilmadi"));
        if (!asset.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Ruxsat berilmagan amal");
        }
        return asset;
    }
}
