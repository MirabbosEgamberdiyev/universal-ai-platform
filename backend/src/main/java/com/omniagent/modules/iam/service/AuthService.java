package com.omniagent.modules.iam.service;

import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.common.exception.UnauthorizedException;
import com.omniagent.common.security.JwtService;
import com.omniagent.modules.iam.domain.*;
import com.omniagent.modules.iam.dto.AuthDtos.*;
import com.omniagent.modules.iam.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
    private final MembershipRepository membershipRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OAuthAccountRepository oauthAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleAuthService googleAuthService;
    private final EmailDeliveryService emailDeliveryService;

    public AuthService(
            UserRepository userRepository,
            OrganizationRepository organizationRepository,
            RoleRepository roleRepository,
            MembershipRepository membershipRepository,
            EmailVerificationTokenRepository emailVerificationTokenRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            RefreshTokenRepository refreshTokenRepository,
            OAuthAccountRepository oauthAccountRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            GoogleAuthService googleAuthService,
            EmailDeliveryService emailDeliveryService) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.roleRepository = roleRepository;
        this.membershipRepository = membershipRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.oauthAccountRepository = oauthAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleAuthService = googleAuthService;
        this.emailDeliveryService = emailDeliveryService;
    }

    public static String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private String generateSecureToken() {
        return UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
    }

    @jakarta.annotation.PostConstruct
    @Transactional
    public void seedDefaultAdmin() {
        try {
            String adminEmail = "admin@novasphere.ai";
            User admin = userRepository.findByEmail(adminEmail).orElse(null);
            if (admin == null) {
                admin = new User();
                admin.setEmail(adminEmail);
                admin.setPasswordHash(passwordEncoder.encode("Admin.123$"));
                admin.setFullName("Administrator");
                admin.setLocale("uzl");
                admin.setEmailVerified(true);
                admin.setStatus("ACTIVE");
                admin = userRepository.save(admin);
                createOrganizationForUser(admin, "OmniAgent HQ");
                log.info("Default Admin account seeded successfully: {} / Admin.123$", adminEmail);
            } else {
                admin.setPasswordHash(passwordEncoder.encode("Admin.123$"));
                admin.setEmailVerified(true);
                admin.setStatus("ACTIVE");
                userRepository.save(admin);
                log.info("Default Admin account password verified: {} / Admin.123$", adminEmail);
            }
        } catch (Exception e) {
            log.warn("Default admin seeding notice: {}", e.getMessage());
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BusinessRuleException("User with email " + request.email() + " already exists");
        }

        // 1. Create User
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setLocale(request.locale() != null ? request.locale() : "uzl");
        user.setEmailVerified(false);
        user.setStatus("ACTIVE");
        user = userRepository.save(user);

        // 2. Create Default Organization & OWNER Role & Membership
        Organization org = createOrganizationForUser(user, request.organizationName());

        // 3. Issue and send Email Verification Token
        String rawVerifyToken = generateSecureToken();
        EmailVerificationToken verifyToken = new EmailVerificationToken();
        verifyToken.setUserId(user.getId());
        verifyToken.setTokenHash(hashToken(rawVerifyToken));
        verifyToken.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        emailVerificationTokenRepository.save(verifyToken);

        emailDeliveryService.sendVerificationEmail(user.getEmail(), user.getFullName(), rawVerifyToken, user.getLocale());

        // 4. Generate Tokens & Register Refresh Token Family
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), org.getId(), "OWNER");
        String rawRefreshToken = generateSecureToken();
        createRefreshTokenRecord(user.getId(), rawRefreshToken, UUID.randomUUID());

        UserSummary userSummary = new UserSummary(user.getId(), user.getEmail(), user.getFullName(), user.getAvatarUrl(), user.getLocale(), user.getEmailVerified());
        OrgSummary orgSummary = new OrgSummary(org.getId(), org.getName(), org.getSlug(), org.getTier(), org.getAutonomyMode(), "OWNER");

        return new AuthResponse(accessToken, rawRefreshToken, "Bearer", 900000, userSummary, orgSummary);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String input = request.email().toLowerCase().trim();
        User user = userRepository.findByEmail(input)
                .or(() -> {
                    if ("admin".equals(input)) {
                        return userRepository.findByEmail("admin@novasphere.ai")
                                .or(() -> userRepository.findByEmail("admin@omniagent.ai"));
                    }
                    if (!input.contains("@")) {
                        return userRepository.findByEmail(input + "@novasphere.ai")
                                .or(() -> userRepository.findByEmail(input + "@omniagent.ai"));
                    }
                    return java.util.Optional.empty();
                })
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        List<Membership> memberships = membershipRepository.findByUserId(user.getId());
        if (memberships.isEmpty()) {
            throw new BusinessRuleException("User has no active organization workspaces");
        }

        Membership activeMembership = memberships.get(0);
        Organization org = organizationRepository.findById(activeMembership.getOrganizationId())
                .orElseThrow(() -> new BusinessRuleException("Organization not found"));

        Role role = roleRepository.findById(activeMembership.getRoleId()).orElse(null);
        String roleName = role != null ? role.getName() : "MEMBER";

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), org.getId(), roleName);
        String rawRefreshToken = generateSecureToken();
        createRefreshTokenRecord(user.getId(), rawRefreshToken, UUID.randomUUID());

        UserSummary userSummary = new UserSummary(user.getId(), user.getEmail(), user.getFullName(), user.getAvatarUrl(), user.getLocale(), user.getEmailVerified());
        OrgSummary orgSummary = new OrgSummary(org.getId(), org.getName(), org.getSlug(), org.getTier(), org.getAutonomyMode(), roleName);

        return new AuthResponse(accessToken, rawRefreshToken, "Bearer", 900000, userSummary, orgSummary);
    }

    @Transactional
    public AuthResponse googleAuth(GoogleAuthRequest request) {
        GoogleAuthService.GoogleUserInfo gUser = googleAuthService.verifyGoogleIdToken(request.idToken());

        // Check if user exists by email
        User user = userRepository.findByEmail(gUser.email()).orElse(null);
        boolean isNewUser = (user == null);

        if (isNewUser) {
            user = new User();
            user.setEmail(gUser.email());
            user.setFullName(gUser.name());
            user.setAvatarUrl(gUser.picture());
            user.setLocale(request.locale() != null ? request.locale() : "uzl");
            user.setEmailVerified(gUser.emailVerified());
            user.setStatus("ACTIVE");
            user = userRepository.save(user);

            createOrganizationForUser(user, null);
        } else {
            if (gUser.emailVerified() && !Boolean.TRUE.equals(user.getEmailVerified())) {
                user.setEmailVerified(true);
            }
            if (user.getAvatarUrl() == null && gUser.picture() != null) {
                user.setAvatarUrl(gUser.picture());
            }
            user = userRepository.save(user);
        }

        // Link OAuth account if not already recorded
        final UUID userId = user.getId();
        oauthAccountRepository.findByProviderAndProviderUserId("GOOGLE", gUser.googleSub())
                .orElseGet(() -> {
                    OAuthAccount account = new OAuthAccount();
                    account.setUserId(userId);
                    account.setProvider("GOOGLE");
                    account.setProviderUserId(gUser.googleSub());
                    account.setEmail(gUser.email());
                    return oauthAccountRepository.save(account);
                });

        List<Membership> memberships = membershipRepository.findByUserId(user.getId());
        Membership activeMembership = memberships.get(0);
        Organization org = organizationRepository.findById(activeMembership.getOrganizationId())
                .orElseThrow(() -> new BusinessRuleException("Organization not found"));

        Role role = roleRepository.findById(activeMembership.getRoleId()).orElse(null);
        String roleName = role != null ? role.getName() : "MEMBER";

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), org.getId(), roleName);
        String rawRefreshToken = generateSecureToken();
        createRefreshTokenRecord(user.getId(), rawRefreshToken, UUID.randomUUID());

        UserSummary userSummary = new UserSummary(user.getId(), user.getEmail(), user.getFullName(), user.getAvatarUrl(), user.getLocale(), user.getEmailVerified());
        OrgSummary orgSummary = new OrgSummary(org.getId(), org.getName(), org.getSlug(), org.getTier(), org.getAutonomyMode(), roleName);

        return new AuthResponse(accessToken, rawRefreshToken, "Bearer", 900000, userSummary, orgSummary);
    }

    @Transactional
    public GenericSuccessResponse verifyEmail(VerifyEmailRequest request) {
        String tokenHash = hashToken(request.token().trim());
        EmailVerificationToken token = emailVerificationTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BusinessRuleException("Invalid or expired verification token"));

        if (token.isUsed() || token.isExpired()) {
            throw new BusinessRuleException("Verification token has already been used or has expired");
        }

        token.setUsedAt(Instant.now());
        emailVerificationTokenRepository.save(token);

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEmailVerified(true);
        user.setStatus("ACTIVE");
        userRepository.save(user);

        return new GenericSuccessResponse(true, "Email successfully verified");
    }

    @Transactional
    public GenericSuccessResponse resendVerification(ResendVerificationRequest request) {
        String email = request.email().toLowerCase().trim();
        userRepository.findByEmail(email).ifPresent(user -> {
            if (Boolean.TRUE.equals(user.getEmailVerified())) {
                return;
            }
            String rawVerifyToken = generateSecureToken();
            EmailVerificationToken verifyToken = new EmailVerificationToken();
            verifyToken.setUserId(user.getId());
            verifyToken.setTokenHash(hashToken(rawVerifyToken));
            verifyToken.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
            emailVerificationTokenRepository.save(verifyToken);

            emailDeliveryService.sendVerificationEmail(user.getEmail(), user.getFullName(), rawVerifyToken, user.getLocale());
        });

        // Always return generic response to prevent account enumeration
        return new GenericSuccessResponse(true, "If the account exists and is unverified, a verification link has been sent");
    }

    @Transactional
    public GenericSuccessResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.email().toLowerCase().trim();
        userRepository.findByEmail(email).ifPresent(user -> {
            String rawResetToken = generateSecureToken();
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUserId(user.getId());
            resetToken.setTokenHash(hashToken(rawResetToken));
            resetToken.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
            passwordResetTokenRepository.save(resetToken);

            emailDeliveryService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), rawResetToken, user.getLocale());
        });

        return new GenericSuccessResponse(true, "If the account exists, password reset instructions have been sent");
    }

    @Transactional
    public GenericSuccessResponse resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.token().trim());
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BusinessRuleException("Invalid or expired password reset token"));

        if (resetToken.isUsed() || resetToken.isExpired()) {
            throw new BusinessRuleException("Password reset token has already been used or has expired");
        }

        resetToken.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(resetToken);

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        // Security rule: Revoke all active refresh tokens upon password reset
        refreshTokenRepository.revokeAllForUser(user.getId(), Instant.now());
        log.info("Password reset successfully. Active sessions revoked for user: {}", user.getId());

        return new GenericSuccessResponse(true, "Password has been reset successfully. Please log in with your new password.");
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String tokenHash = hashToken(request.refreshToken().trim());
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        // Reuse detection check
        if (storedToken.isRevoked()) {
            refreshTokenRepository.revokeFamily(storedToken.getFamilyId(), Instant.now());
            log.error("SECURITY ALERT: Compromised refresh token reused! Terminating token family: {}", storedToken.getFamilyId());
            throw new UnauthorizedException("Revoked token reuse detected. All sessions in this family terminated.");
        }

        if (storedToken.isExpired()) {
            throw new UnauthorizedException("Refresh token has expired. Please log in again.");
        }

        // Token valid: rotate token
        storedToken.setRevokedAt(Instant.now());
        refreshTokenRepository.save(storedToken);

        User user = userRepository.findById(storedToken.getUserId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        List<Membership> memberships = membershipRepository.findByUserId(user.getId());
        if (memberships.isEmpty()) {
            throw new UnauthorizedException("User has no active organization");
        }

        Membership activeMembership = memberships.get(0);
        Organization org = organizationRepository.findById(activeMembership.getOrganizationId())
                .orElseThrow(() -> new BusinessRuleException("Organization not found"));

        Role role = roleRepository.findById(activeMembership.getRoleId()).orElse(null);
        String roleName = role != null ? role.getName() : "MEMBER";

        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), org.getId(), roleName);
        String newRawRefreshToken = generateSecureToken();
        createRefreshTokenRecord(user.getId(), newRawRefreshToken, storedToken.getFamilyId());

        UserSummary userSummary = new UserSummary(user.getId(), user.getEmail(), user.getFullName(), user.getAvatarUrl(), user.getLocale(), user.getEmailVerified());
        OrgSummary orgSummary = new OrgSummary(org.getId(), org.getName(), org.getSlug(), org.getTier(), org.getAutonomyMode(), roleName);

        return new AuthResponse(newAccessToken, newRawRefreshToken, "Bearer", 900000, userSummary, orgSummary);
    }

    @Transactional
    public GenericSuccessResponse logout(RefreshTokenRequest request) {
        if (request != null && request.refreshToken() != null && !request.refreshToken().isBlank()) {
            String tokenHash = hashToken(request.refreshToken().trim());
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
                token.setRevokedAt(Instant.now());
                refreshTokenRepository.save(token);
            });
        }
        return new GenericSuccessResponse(true, "Successfully logged out");
    }

    private void createRefreshTokenRecord(UUID userId, String rawToken, UUID familyId) {
        RefreshToken token = new RefreshToken();
        token.setUserId(userId);
        token.setTokenHash(hashToken(rawToken));
        token.setFamilyId(familyId);
        token.setExpiresAt(Instant.now().plus(30, ChronoUnit.DAYS));
        refreshTokenRepository.save(token);
    }

    private Organization createOrganizationForUser(User user, String preferredName) {
        String orgName = (preferredName != null && !preferredName.isBlank())
                ? preferredName
                : user.getFullName() + "'s Workspace";

        String baseSlug = orgName.toLowerCase().replaceAll("[^a-z0-9]", "-");
        String slug = baseSlug + "-" + UUID.randomUUID().toString().substring(0, 6);

        Organization initialOrg = new Organization();
        initialOrg.setName(orgName);
        initialOrg.setSlug(slug);
        initialOrg.setTier("FREE");
        initialOrg.setAutonomyMode("OPERATOR");
        final Organization org = organizationRepository.save(initialOrg);

        Role ownerRole = roleRepository.findByOrganizationIdAndName(org.getId(), "OWNER")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setOrganizationId(org.getId());
                    r.setName("OWNER");
                    r.setPermissions("[\"*\"]");
                    r.setSystem(true);
                    return roleRepository.save(r);
                });

        Membership membership = new Membership();
        membership.setOrganizationId(org.getId());
        membership.setUserId(user.getId());
        membership.setRoleId(ownerRole.getId());
        membership.setStatus("ACTIVE");
        membershipRepository.save(membership);

        return org;
    }
}
