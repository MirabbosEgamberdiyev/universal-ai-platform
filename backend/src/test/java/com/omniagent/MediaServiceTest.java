package com.omniagent;

import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.modules.content.domain.ContentAsset;
import com.omniagent.modules.content.repository.ContentAssetRepository;
import com.omniagent.modules.media.service.MediaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

public class MediaServiceTest {

    private ContentAssetRepository assetRepository;
    private MediaService mediaService;

    @BeforeEach
    void setup() {
        assetRepository = Mockito.mock(ContentAssetRepository.class);
        mediaService = new MediaService(assetRepository);
    }

    @Test
    void testUploadValidJpeg() {
        UUID orgId = UUID.randomUUID();
        // JPEG magic bytes
        byte[] jpegContent = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10, 'J', 'F', 'I', 'F'};
        MockMultipartFile file = new MockMultipartFile("file", "photo.jpg", "image/jpeg", jpegContent);

        Mockito.when(assetRepository.save(any(ContentAsset.class))).thenAnswer(inv -> {
            ContentAsset ca = inv.getArgument(0);
            if (ca.getId() == null) {
                ca.setId(UUID.randomUUID());
            }
            return ca;
        });

        ContentAsset result = mediaService.uploadMedia(orgId, file, "Marketing, Banner");
        assertNotNull(result);
        assertEquals("image/jpeg", result.getMimeType());
        assertEquals("IMAGE", result.getAssetType());
        assertEquals(orgId, result.getOrganizationId());
    }

    @Test
    void testUploadRejectsCorruptFile() {
        UUID orgId = UUID.randomUUID();
        byte[] fakeContent = "not a valid image or video header".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "fake.jpg", "image/jpeg", fakeContent);

        assertThrows(BusinessRuleException.class, () -> {
            mediaService.uploadMedia(orgId, file, null);
        });
    }

    @Test
    void testDeleteMediaEnforcesTenantOwnership() {
        UUID orgA = UUID.randomUUID();
        UUID orgB = UUID.randomUUID();
        UUID assetId = UUID.randomUUID();

        ContentAsset asset = new ContentAsset();
        asset.setId(assetId);
        asset.setOrganizationId(orgA);

        Mockito.when(assetRepository.findById(assetId)).thenReturn(Optional.of(asset));

        assertThrows(BusinessRuleException.class, () -> {
            mediaService.deleteMedia(orgB, assetId);
        });
    }
}
