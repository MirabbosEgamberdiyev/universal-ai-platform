package com.omniagent.modules.vault.service;

import com.omniagent.common.exception.BusinessRuleException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class TokenVaultService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // 96 bits recommended for GCM
    private static final int GCM_TAG_LENGTH = 128; // 128 bits auth tag

    private final SecretKey masterSecretKey;
    private final SecureRandom secureRandom = new SecureRandom();
    private final String currentKeyId = "kms-v1-primary";

    public TokenVaultService(@Value("${omniagent.vault.master-key:7vF8kL3zQp1mN4bW9xR2tY5uI8oP0sA3dF6gH9jK1lE=}") String base64MasterKey) {
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(base64MasterKey);
            if (keyBytes.length != 32) {
                // Pad or derive 256 bits if needed
                byte[] padded = new byte[32];
                System.arraycopy(keyBytes, 0, padded, 0, Math.min(keyBytes.length, 32));
                keyBytes = padded;
            }
        } catch (IllegalArgumentException e) {
            byte[] raw = base64MasterKey.getBytes(StandardCharsets.UTF_8);
            byte[] padded = new byte[32];
            System.arraycopy(raw, 0, padded, 0, Math.min(raw.length, 32));
            keyBytes = padded;
        }
        this.masterSecretKey = new SecretKeySpec(keyBytes, "AES");
    }

    @PostConstruct
    public void verifyVaultIntegrity() {
        String probe = "KMS_PROBE_" + System.currentTimeMillis();
        EncryptedPayload payload = encrypt(probe);
        String decrypted = decrypt(payload.ciphertext());
        if (!probe.equals(decrypted)) {
            throw new IllegalStateException("FATAL: Token Vault cryptographic self-test failed! Decrypted text does not match probe.");
        }
    }

    public EncryptedPayload encrypt(String plaintext) {
        if (plaintext == null || plaintext.isEmpty()) {
            return null;
        }
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, masterSecretKey, parameterSpec);

            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            // Pack IV + Ciphertext into single blob for seamless storage
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            byteBuffer.put(iv);
            byteBuffer.put(ciphertext);

            return new EncryptedPayload(currentKeyId, byteBuffer.array());
        } catch (Exception e) {
            throw new BusinessRuleException("Cryptographic encryption failure in Token Vault: " + e.getMessage());
        }
    }

    public String decrypt(byte[] packedCiphertext) {
        if (packedCiphertext == null || packedCiphertext.length < GCM_IV_LENGTH) {
            return null;
        }
        try {
            ByteBuffer byteBuffer = ByteBuffer.wrap(packedCiphertext);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);

            byte[] ciphertext = new byte[byteBuffer.remaining()];
            byteBuffer.get(ciphertext);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, masterSecretKey, parameterSpec);

            byte[] plainBytes = cipher.doFinal(ciphertext);
            return new String(plainBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new BusinessRuleException("Cryptographic decryption failure in Token Vault: " + e.getMessage());
        }
    }

    public String getCurrentKeyId() {
        return currentKeyId;
    }

    public record EncryptedPayload(String keyId, byte[] ciphertext) {}
}
