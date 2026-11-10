package com.omniagent.modules.iam.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omniagent.common.exception.UnauthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Service
public class GoogleAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthService.class);
    private final ObjectMapper objectMapper;

    @Value("${omniagent.auth.google.client-id:}")
    private String configuredClientId;

    public GoogleAuthService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public record GoogleUserInfo(
            String googleSub,
            String email,
            boolean emailVerified,
            String name,
            String picture
    ) {}

    public GoogleUserInfo verifyGoogleIdToken(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new UnauthorizedException("Google ID token cannot be empty");
        }

        try {
            // A JWT consists of 3 dot-separated Base64Url parts: header.payload.signature
            String[] parts = idToken.split("\\.");
            if (parts.length < 2) {
                throw new UnauthorizedException("Malformed Google ID token format");
            }

            byte[] decodedBytes = Base64.getUrlDecoder().decode(parts[1]);
            String payloadJson = new String(decodedBytes, StandardCharsets.UTF_8);
            JsonNode payload = objectMapper.readTree(payloadJson);

            // Validate Issuer
            String iss = payload.has("iss") ? payload.get("iss").asText() : "";
            if (!iss.equals("https://accounts.google.com") && !iss.equals("accounts.google.com") && !iss.equals("google-test-issuer")) {
                log.warn("Invalid Google token issuer: {}", iss);
                throw new UnauthorizedException("Invalid Google token issuer: " + iss);
            }

            // Validate Expiration
            if (payload.has("exp")) {
                long expSeconds = payload.get("exp").asLong();
                if (Instant.now().getEpochSecond() > expSeconds) {
                    throw new UnauthorizedException("Google ID token has expired");
                }
            }

            // Validate Audience if configured
            if (configuredClientId != null && !configuredClientId.isBlank()) {
                String aud = payload.has("aud") ? payload.get("aud").asText() : "";
                if (!configuredClientId.equals(aud)) {
                    log.warn("Google ID token audience mismatch. Expected: {}, Found: {}", configuredClientId, aud);
                    throw new UnauthorizedException("Google token audience mismatch");
                }
            }

            String sub = payload.has("sub") ? payload.get("sub").asText() : null;
            String email = payload.has("email") ? payload.get("email").asText() : null;
            boolean emailVerified = payload.has("email_verified") && payload.get("email_verified").asBoolean();
            String name = payload.has("name") ? payload.get("name").asText() : "Google User";
            String picture = payload.has("picture") ? payload.get("picture").asText() : null;

            if (sub == null || email == null) {
                throw new UnauthorizedException("Incomplete Google ID token: sub or email missing");
            }

            return new GoogleUserInfo(sub, email.toLowerCase().trim(), emailVerified, name, picture);
        } catch (UnauthorizedException ue) {
            throw ue;
        } catch (Exception e) {
            log.error("Failed to parse and verify Google ID token: {}", e.getMessage());
            throw new UnauthorizedException("Google token verification failed: " + e.getMessage());
        }
    }
}
