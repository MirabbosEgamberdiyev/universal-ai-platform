package com.omniagent.modules.media.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.content.domain.ContentAsset;
import com.omniagent.modules.media.service.MediaService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    public ResponseEntity<List<ContentAsset>> listMedia(@RequestParam(required = false) String type) {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(mediaService.listMedia(orgId, type));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContentAsset> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "tags", required = false) String tags) {
        UUID orgId = TenantContext.getCurrentTenant();
        ContentAsset asset = mediaService.uploadMedia(orgId, file, tags);
        return ResponseEntity.ok(asset);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedia(@PathVariable UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        mediaService.deleteMedia(orgId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/raw")
    public ResponseEntity<byte[]> getRawMedia(@PathVariable UUID id) {
        UUID orgId = TenantContext.getCurrentTenant();
        ContentAsset asset = mediaService.getMediaAsset(orgId, id);
        byte[] bytes = mediaService.getMediaRawBytes(orgId, id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, asset.getMimeType() != null ? asset.getMimeType() : MediaType.APPLICATION_OCTET_STREAM_VALUE)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + (asset.getOriginalFilename() != null ? asset.getOriginalFilename() : "media") + "\"")
                .body(bytes);
    }
}
