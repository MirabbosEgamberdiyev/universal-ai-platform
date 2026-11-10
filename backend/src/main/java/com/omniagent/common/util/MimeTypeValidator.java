package com.omniagent.common.util;

import com.omniagent.common.exception.BusinessRuleException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.Set;

/**
 * Enterprise MIME Type and Magic Byte Inspector.
 * Prevents file extension spoofing and polyglot attacks by inspecting raw header bytes.
 */
public final class MimeTypeValidator {

    private static final Logger log = LoggerFactory.getLogger(MimeTypeValidator.class);

    private static final Set<String> ALLOWED_IMAGE_MIMES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    private static final Set<String> ALLOWED_VIDEO_MIMES = Set.of(
            "video/mp4",
            "video/quicktime",
            "video/webm"
    );

    private MimeTypeValidator() {}

    /**
     * Inspects the initial bytes of a binary file and returns the genuine detected MIME type.
     */
    public static String detectMimeType(byte[] data) {
        if (data == null || data.length < 4) {
            throw new BusinessRuleException("Fayl hajmi tekshirish uchun juda kichik yoki bo'sh");
        }

        // JPEG: FF D8 FF
        if ((data[0] & 0xFF) == 0xFF && (data[1] & 0xFF) == 0xD8 && (data[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }

        // PNG: 89 50 4E 47
        if ((data[0] & 0xFF) == 0x89 && (data[1] & 0xFF) == 0x50 &&
            (data[2] & 0xFF) == 0x4E && (data[3] & 0xFF) == 0x47) {
            return "image/png";
        }

        // GIF: 47 49 46 38 ("GIF8")
        if (data[0] == 'G' && data[1] == 'I' && data[2] == 'F' && data[3] == '8') {
            return "image/gif";
        }

        // WEBP: RIFF....WEBP (minimum 12 bytes)
        if (data.length >= 12 &&
            data[0] == 'R' && data[1] == 'I' && data[2] == 'F' && data[3] == 'F' &&
            data[8] == 'W' && data[9] == 'E' && data[10] == 'B' && data[11] == 'P') {
            return "image/webp";
        }

        // MP4 / QuickTime: bytes 4..7 == "ftyp" or "moov"
        if (data.length >= 8) {
            if (data[4] == 'f' && data[5] == 't' && data[6] == 'y' && data[7] == 'p') {
                return "video/mp4";
            }
            if (data[4] == 'm' && data[5] == 'o' && data[6] == 'o' && data[7] == 'v') {
                return "video/quicktime";
            }
        }

        // WEBM / MKV: EBML 1A 45 DF A3
        if ((data[0] & 0xFF) == 0x1A && (data[1] & 0xFF) == 0x45 &&
            (data[2] & 0xFF) == 0xDF && (data[3] & 0xFF) == 0xA3) {
            return "video/webm";
        }

        // PDF: 25 50 44 46 ("%PDF")
        if (data[0] == '%' && data[1] == 'P' && data[2] == 'D' && data[3] == 'F') {
            return "application/pdf";
        }

        throw new BusinessRuleException("Qo'llab-quvvatlanmagan yoki xavfli fayl formati (MIME Magic Bytes tan olinmadi)");
    }

    /**
     * Validates that the claimed MIME type or file extension strictly matches the genuine magic bytes.
     */
    public static String validateAndNormalize(byte[] data, String claimedFilename, String claimedMime) {
        String detected = detectMimeType(data);

        if (claimedMime != null && !claimedMime.isBlank() && !claimedMime.equals("application/octet-stream")) {
            // Check equivalence or family match
            boolean matches = detected.equalsIgnoreCase(claimedMime) ||
                    (detected.equals("image/jpeg") && claimedMime.equalsIgnoreCase("image/jpg")) ||
                    (detected.equals("video/mp4") && (claimedMime.equalsIgnoreCase("video/quicktime") || claimedMime.equalsIgnoreCase("video/mp4")));
            if (!matches) {
                log.warn("MIME spoofing detected! Claimed: {}, Actual: {}, File: {}", claimedMime, detected, claimedFilename);
                throw new BusinessRuleException("Xavfsizlik xatosi: Fayl kengaytmasi yoki MIME turi uning haqiqiy tarkibiga mos kelmaydi (Claimed: " + claimedMime + ", Actual: " + detected + ")");
            }
        }

        // Ensure allowed media type
        if (!ALLOWED_IMAGE_MIMES.contains(detected) && !ALLOWED_VIDEO_MIMES.contains(detected)) {
            throw new BusinessRuleException("Faqat tasvir (JPEG, PNG, GIF, WEBP) yoki video (MP4, WEBM, MOV) fayllari ruxsat etiladi. Aniqlangan: " + detected);
        }

        return detected;
    }

    public static boolean isImage(String mimeType) {
        return ALLOWED_IMAGE_MIMES.contains(mimeType);
    }

    public static boolean isVideo(String mimeType) {
        return ALLOWED_VIDEO_MIMES.contains(mimeType);
    }
}
