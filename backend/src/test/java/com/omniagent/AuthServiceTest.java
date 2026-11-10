package com.omniagent;

import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.exception.UnauthorizedException;
import com.omniagent.common.security.JwtService;
import com.omniagent.modules.iam.domain.*;
import com.omniagent.modules.iam.dto.AuthDtos.*;
import com.omniagent.modules.iam.repository.*;
import com.omniagent.modules.iam.service.AuthService;
import com.omniagent.modules.iam.service.EmailDeliveryService;
import com.omniagent.modules.iam.service.GoogleAuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AuthServiceTest {

    private UserRepository userRepository;
    private OrganizationRepository organizationRepository;
    private RoleRepository roleRepository;
    private MembershipRepository membershipRepository;
    private EmailVerificationTokenRepository emailVerificationTokenRepository;
    private PasswordResetTokenRepository passwordResetTokenRepository;
    private RefreshTokenRepository refreshTokenRepository;
    private OAuthAccountRepository oauthAccountRepository;
    private GoogleAuthService googleAuthService;
    private EmailDeliveryService emailDeliveryService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        organizationRepository = mock(OrganizationRepository.class);
        roleRepository = mock(RoleRepository.class);
        membershipRepository = mock(MembershipRepository.class);
        emailVerificationTokenRepository = mock(EmailVerificationTokenRepository.class);
        passwordResetTokenRepository = mock(PasswordResetTokenRepository.class);
        refreshTokenRepository = mock(RefreshTokenRepository.class);
        oauthAccountRepository = mock(OAuthAccountRepository.class);
        googleAuthService = mock(GoogleAuthService.class);
        emailDeliveryService = mock(EmailDeliveryService.class);

        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        JwtService jwtService = new JwtService("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970", 60000, 300000);

        authService = new AuthService(
                userRepository,
                organizationRepository,
                roleRepository,
                membershipRepository,
                emailVerificationTokenRepository,
                passwordResetTokenRepository,
                refreshTokenRepository,
                oauthAccountRepository,
                passwordEncoder,
                jwtService,
                googleAuthService,
                emailDeliveryService
        );
    }

    @Test
    @DisplayName("Should successfully register a new user, dispatch verification email, and provision default workspace")
    void testRegisterUser() {
        when(userRepository.existsByEmail("creator@example.com")).thenReturn(false);

        User savedUser = new User();
        savedUser.setId(UUID.randomUUID());
        savedUser.setEmail("creator@example.com");
        savedUser.setFullName("Alisher Navoiy");
        savedUser.setLocale("uzl");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        Organization savedOrg = new Organization();
        savedOrg.setId(UUID.randomUUID());
        savedOrg.setName("Alisher's Creative Studio");
        savedOrg.setSlug("alisher-studio");
        savedOrg.setTier("FREE");
        savedOrg.setAutonomyMode("OPERATOR");
        when(organizationRepository.save(any(Organization.class))).thenReturn(savedOrg);

        Role ownerRole = new Role();
        ownerRole.setId(UUID.randomUUID());
        ownerRole.setName("OWNER");
        when(roleRepository.findByOrganizationIdAndName(any(UUID.class), eq("OWNER")))
                .thenReturn(Optional.of(ownerRole));

        RegisterRequest request = new RegisterRequest(
                "Alisher Navoiy",
                "creator@example.com",
                "SecretPassword123!",
                "Alisher's Creative Studio",
                "uzl"
        );

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertNotNull(response.accessToken());
        assertNotNull(response.refreshToken());
        assertEquals("creator@example.com", response.user().email());
        assertEquals("OPERATOR", response.activeOrganization().autonomyMode());

        verify(emailVerificationTokenRepository, times(1)).save(any(EmailVerificationToken.class));
        verify(emailDeliveryService, times(1)).sendVerificationEmail(eq("creator@example.com"), eq("Alisher Navoiy"), anyString(), eq("uzl"));
    }

    @Test
    @DisplayName("Should successfully authenticate registered user with matching credentials")
    void testLoginSuccess() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User existingUser = new User();
        existingUser.setId(UUID.randomUUID());
        existingUser.setEmail("bob@example.com");
        existingUser.setPasswordHash(encoder.encode("CorrectPassword123!"));
        existingUser.setFullName("Bob Smith");
        existingUser.setLocale("uzl");

        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(existingUser));

        UUID orgId = UUID.randomUUID();
        Membership membership = new Membership();
        membership.setOrganizationId(orgId);
        membership.setUserId(existingUser.getId());
        membership.setRoleId(UUID.randomUUID());
        when(membershipRepository.findByUserId(existingUser.getId())).thenReturn(List.of(membership));

        Organization org = new Organization();
        org.setId(orgId);
        org.setName("Bob Tech LLC");
        org.setSlug("bob-tech");
        org.setTier("PRO");
        org.setAutonomyMode("OPERATOR");
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(org));

        Role role = new Role();
        role.setName("OWNER");
        when(roleRepository.findById(membership.getRoleId())).thenReturn(Optional.of(role));

        LoginRequest loginRequest = new LoginRequest("bob@example.com", "CorrectPassword123!");
        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("bob@example.com", response.user().email());
        assertEquals("PRO", response.activeOrganization().tier());
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Should successfully authenticate using username 'Admin' resolving to admin email")
    void testLoginWithAdminUsername() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User adminUser = new User();
        adminUser.setId(UUID.randomUUID());
        adminUser.setEmail("admin@novasphere.ai");
        adminUser.setPasswordHash(encoder.encode("Admin.123$"));
        adminUser.setFullName("Administrator");
        adminUser.setLocale("uzl");

        when(userRepository.findByEmail("admin")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("admin@novasphere.ai")).thenReturn(Optional.of(adminUser));

        UUID orgId = UUID.randomUUID();
        Membership membership = new Membership();
        membership.setOrganizationId(orgId);
        membership.setUserId(adminUser.getId());
        membership.setRoleId(UUID.randomUUID());
        when(membershipRepository.findByUserId(adminUser.getId())).thenReturn(List.of(membership));

        Organization org = new Organization();
        org.setId(orgId);
        org.setName("OmniAgent HQ");
        org.setSlug("omniagent-hq");
        org.setTier("ENTERPRISE");
        org.setAutonomyMode("AUTOPILOT");
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(org));

        Role role = new Role();
        role.setName("OWNER");
        when(roleRepository.findById(membership.getRoleId())).thenReturn(Optional.of(role));

        LoginRequest loginRequest = new LoginRequest("Admin", "Admin.123$");
        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("admin@novasphere.ai", response.user().email());
        assertEquals("ENTERPRISE", response.activeOrganization().tier());
    }

    @Test
    @DisplayName("Should verify email successfully with valid token")
    void testVerifyEmailSuccess() {
        String rawToken = "sample-raw-verification-token-12345";
        String tokenHash = AuthService.hashToken(rawToken);

        UUID userId = UUID.randomUUID();
        EmailVerificationToken token = new EmailVerificationToken();
        token.setId(UUID.randomUUID());
        token.setUserId(userId);
        token.setTokenHash(tokenHash);
        token.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));

        User user = new User();
        user.setId(userId);
        user.setEmail("user@example.com");
        user.setEmailVerified(false);

        when(emailVerificationTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(token));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        GenericSuccessResponse response = authService.verifyEmail(new VerifyEmailRequest(rawToken));

        assertTrue(response.success());
        assertTrue(user.getEmailVerified());
        assertNotNull(token.getUsedAt());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Should rotate refresh token and revoke previous token")
    void testRefreshTokenRotation() {
        String rawRefreshToken = "old-raw-refresh-token-xyz";
        String tokenHash = AuthService.hashToken(rawRefreshToken);

        UUID userId = UUID.randomUUID();
        UUID familyId = UUID.randomUUID();
        RefreshToken storedToken = new RefreshToken();
        storedToken.setId(UUID.randomUUID());
        storedToken.setUserId(userId);
        storedToken.setTokenHash(tokenHash);
        storedToken.setFamilyId(familyId);
        storedToken.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));

        User user = new User();
        user.setId(userId);
        user.setEmail("user@example.com");
        user.setFullName("Test User");
        user.setLocale("uzl");

        UUID orgId = UUID.randomUUID();
        Membership membership = new Membership();
        membership.setOrganizationId(orgId);
        membership.setUserId(userId);
        membership.setRoleId(UUID.randomUUID());

        Organization org = new Organization();
        org.setId(orgId);
        org.setName("Org 1");
        org.setSlug("org-1");
        org.setTier("PRO");
        org.setAutonomyMode("AUTONOMOUS");

        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(storedToken));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(membershipRepository.findByUserId(userId)).thenReturn(List.of(membership));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(org));

        AuthResponse response = authService.refreshToken(new RefreshTokenRequest(rawRefreshToken));

        assertNotNull(response);
        assertNotNull(response.accessToken());
        assertNotNull(response.refreshToken());
        assertNotNull(storedToken.getRevokedAt()); // Old token revoked!
    }

    @Test
    @DisplayName("Should detect revoked refresh token reuse and revoke entire family")
    void testRefreshTokenReuseDetection() {
        String rawRefreshToken = "compromised-token";
        String tokenHash = AuthService.hashToken(rawRefreshToken);

        UUID familyId = UUID.randomUUID();
        RefreshToken revokedToken = new RefreshToken();
        revokedToken.setTokenHash(tokenHash);
        revokedToken.setFamilyId(familyId);
        revokedToken.setRevokedAt(Instant.now().minus(1, ChronoUnit.HOURS)); // Already revoked!

        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(revokedToken));

        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () ->
                authService.refreshToken(new RefreshTokenRequest(rawRefreshToken))
        );

        assertTrue(exception.getMessage().contains("reuse detected"));
        verify(refreshTokenRepository, times(1)).revokeFamily(eq(familyId), any(Instant.class));
    }
}
