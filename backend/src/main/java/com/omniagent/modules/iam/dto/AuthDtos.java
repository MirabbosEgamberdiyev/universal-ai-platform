package com.omniagent.modules.iam.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank(message = "Full name is required")
            String fullName,

            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "Password is required")
            @Size(min = 8, message = "Password must be at least 8 characters")
            String password,

            String organizationName,
            String locale
    ) {}

    public record LoginRequest(
            @NotBlank(message = "Email or Username is required")
            String email,

            @NotBlank(message = "Password is required")
            String password
    ) {}

    public record GoogleAuthRequest(
            @NotBlank(message = "Google ID token is required")
            String idToken,
            String locale
    ) {}

    public record VerifyEmailRequest(
            @NotBlank(message = "Verification token is required")
            String token
    ) {}

    public record ResendVerificationRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email
    ) {}

    public record ForgotPasswordRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email
    ) {}

    public record ResetPasswordRequest(
            @NotBlank(message = "Reset token is required")
            String token,

            @NotBlank(message = "Password is required")
            @Size(min = 8, message = "Password must be at least 8 characters")
            String newPassword
    ) {}

    public record RefreshTokenRequest(
            @NotBlank(message = "Refresh token is required")
            String refreshToken
    ) {}

    public record UpdateProfileRequest(
            String fullName,
            String avatarUrl,
            String locale
    ) {}

    public record GenericSuccessResponse(
            boolean success,
            String message
    ) {}

    public record AuthResponse(
            String accessToken,
            String refreshToken,
            String tokenType,
            long expiresInMs,
            UserSummary user,
            OrgSummary activeOrganization
    ) {}

    public record UserSummary(
            UUID id,
            String email,
            String fullName,
            String avatarUrl,
            String locale,
            Boolean isEmailVerified
    ) {
        public UserSummary(UUID id, String email, String fullName, String avatarUrl, String locale) {
            this(id, email, fullName, avatarUrl, locale, false);
        }
    }

    public record OrgSummary(
            UUID id,
            String name,
            String slug,
            String tier,
            String autonomyMode,
            String role
    ) {}

    public record CreateOrgRequest(
            @NotBlank(message = "Organization name is required")
            String name,
            String slug
    ) {}

    public record SwitchOrgRequest(
            UUID organizationId
    ) {}
}
