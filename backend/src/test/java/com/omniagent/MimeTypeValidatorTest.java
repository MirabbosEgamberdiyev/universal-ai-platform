package com.omniagent;

import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.util.MimeTypeValidator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class MimeTypeValidatorTest {

    @Test
    void testDetectJpeg() {
        byte[] jpegBytes = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10};
        String mime = MimeTypeValidator.detectMimeType(jpegBytes);
        assertEquals("image/jpeg", mime);
        assertTrue(MimeTypeValidator.isImage(mime));
    }

    @Test
    void testDetectPng() {
        byte[] pngBytes = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        String mime = MimeTypeValidator.detectMimeType(pngBytes);
        assertEquals("image/png", mime);
        assertTrue(MimeTypeValidator.isImage(mime));
    }

    @Test
    void testDetectMp4() {
        byte[] mp4Bytes = new byte[]{0x00, 0x00, 0x00, 0x18, 'f', 't', 'y', 'p', 'm', 'p', '4', '2'};
        String mime = MimeTypeValidator.detectMimeType(mp4Bytes);
        assertEquals("video/mp4", mime);
        assertTrue(MimeTypeValidator.isVideo(mime));
    }

    @Test
    void testRejectSpoofedExtension() {
        // Raw bytes are a plain text file or invalid binary, but claimed to be image/jpeg
        byte[] fakeBytes = "Hello this is a malicious script disguise".getBytes();
        assertThrows(BusinessRuleException.class, () -> {
            MimeTypeValidator.validateAndNormalize(fakeBytes, "malicious.jpg", "image/jpeg");
        });
    }

    @Test
    void testRejectMismatchedMime() {
        // Real PNG bytes, but client claims it is video/mp4
        byte[] pngBytes = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        assertThrows(BusinessRuleException.class, () -> {
            MimeTypeValidator.validateAndNormalize(pngBytes, "image.png", "video/mp4");
        });
    }
}
