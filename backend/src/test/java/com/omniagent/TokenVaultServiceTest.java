package com.omniagent;

import com.omniagent.modules.vault.service.TokenVaultService;
import com.omniagent.modules.vault.service.TokenVaultService.EncryptedPayload;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class TokenVaultServiceTest {

    private TokenVaultService tokenVaultService;

    @BeforeEach
    void setUp() {
        tokenVaultService = new TokenVaultService("7vF8kL3zQp1mN4bW9xR2tY5uI8oP0sA3dF6gH9jK1lE=");
    }

    @Test
    @DisplayName("Should successfully encrypt and decrypt sensitive token with AES-256-GCM")
    void testEncryptAndDecrypt() {
        String originalToken = "1234567890:ABCdefGhIJKlmNoPQRstuVWXyz_testToken";

        EncryptedPayload encrypted = tokenVaultService.encrypt(originalToken);

        assertNotNull(encrypted);
        assertEquals("kms-v1-primary", encrypted.keyId());
        assertNotEquals(originalToken, new String(encrypted.ciphertext()));

        String decrypted = tokenVaultService.decrypt(encrypted.ciphertext());
        assertEquals(originalToken, decrypted);
    }

    @Test
    @DisplayName("Should return null when encrypting or decrypting null/empty payloads")
    void testNullHandling() {
        assertNull(tokenVaultService.encrypt(null));
        assertNull(tokenVaultService.encrypt(""));
        assertNull(tokenVaultService.decrypt(null));
        assertNull(tokenVaultService.decrypt(new byte[5])); // Invalid short IV
    }
}
