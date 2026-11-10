package com.omniagent.modules.iam.service;

import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.common.security.JwtService;
import com.omniagent.modules.iam.domain.Membership;
import com.omniagent.modules.iam.domain.Organization;
import com.omniagent.modules.iam.domain.Role;
import com.omniagent.modules.iam.domain.User;
import com.omniagent.modules.iam.dto.AuthDtos.*;
import com.omniagent.modules.iam.repository.MembershipRepository;
import com.omniagent.modules.iam.repository.OrganizationRepository;
import com.omniagent.modules.iam.repository.RoleRepository;
import com.omniagent.modules.iam.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final MembershipRepository membershipRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final com.omniagent.modules.vault.service.TokenVaultService tokenVaultService;
    private final com.omniagent.modules.ai.provider.GeminiAiProvider geminiAiProvider;
    private final com.omniagent.modules.ai.provider.ClaudeAiProvider claudeAiProvider;
    private final com.omniagent.modules.ai.provider.OpenAiProvider openAiProvider;

    public OrganizationService(
            OrganizationRepository organizationRepository,
            MembershipRepository membershipRepository,
            RoleRepository roleRepository,
            UserRepository userRepository,
            JwtService jwtService,
            com.omniagent.modules.vault.service.TokenVaultService tokenVaultService,
            com.omniagent.modules.ai.provider.GeminiAiProvider geminiAiProvider,
            com.omniagent.modules.ai.provider.ClaudeAiProvider claudeAiProvider,
            com.omniagent.modules.ai.provider.OpenAiProvider openAiProvider) {
        this.organizationRepository = organizationRepository;
        this.membershipRepository = membershipRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.tokenVaultService = tokenVaultService;
        this.geminiAiProvider = geminiAiProvider;
        this.claudeAiProvider = claudeAiProvider;
        this.openAiProvider = openAiProvider;
    }

    @Transactional(readOnly = true)
    public List<OrgSummary> getUserOrganizations(UUID userId) {
        List<Membership> memberships = membershipRepository.findByUserId(userId);
        List<OrgSummary> result = new ArrayList<>();

        for (Membership m : memberships) {
            organizationRepository.findById(m.getOrganizationId()).ifPresent(org -> {
                String roleName = roleRepository.findById(m.getRoleId())
                        .map(Role::getName)
                        .orElse("MEMBER");
                result.add(new OrgSummary(org.getId(), org.getName(), org.getSlug(), org.getTier(), org.getAutonomyMode(), roleName));
            });
        }
        return result;
    }

    @Transactional
    public OrgSummary createOrganization(UUID userId, CreateOrgRequest request) {
        String slug = request.slug();
        if (slug == null || slug.isBlank()) {
            slug = request.name().toLowerCase().replaceAll("[^a-z0-9]", "-") + "-" + UUID.randomUUID().toString().substring(0, 6);
        }

        if (organizationRepository.existsBySlug(slug)) {
            throw new BusinessRuleException("Organization slug " + slug + " is already taken");
        }

        Organization org = new Organization();
        org.setName(request.name());
        org.setSlug(slug);
        org.setTier("FREE");
        org.setAutonomyMode("OPERATOR");
        final Organization savedOrg = organizationRepository.save(org);

        Role ownerRole = roleRepository.findByOrganizationIdAndName(savedOrg.getId(), "OWNER")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setOrganizationId(savedOrg.getId());
                    r.setName("OWNER");
                    r.setPermissions("[\"*\"]");
                    r.setSystem(true);
                    return roleRepository.save(r);
                });

        Membership membership = new Membership();
        membership.setOrganizationId(savedOrg.getId());
        membership.setUserId(userId);
        membership.setRoleId(ownerRole.getId());
        membership.setStatus("ACTIVE");
        membershipRepository.save(membership);

        return new OrgSummary(savedOrg.getId(), savedOrg.getName(), savedOrg.getSlug(), savedOrg.getTier(), savedOrg.getAutonomyMode(), "OWNER");
    }

    @Transactional
    public AuthResponse switchOrganization(UUID userId, UUID targetOrgId) {
        Membership membership = membershipRepository.findByOrganizationIdAndUserId(targetOrgId, userId)
                .orElseThrow(() -> new BusinessRuleException("User is not a member of target organization"));

        Organization org = organizationRepository.findById(targetOrgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String roleName = roleRepository.findById(membership.getRoleId())
                .map(Role::getName)
                .orElse("MEMBER");

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), org.getId(), roleName);
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        UserSummary userSummary = new UserSummary(user.getId(), user.getEmail(), user.getFullName(), user.getAvatarUrl(), user.getLocale());
        OrgSummary orgSummary = new OrgSummary(org.getId(), org.getName(), org.getSlug(), org.getTier(), org.getAutonomyMode(), roleName);

        return new AuthResponse(accessToken, refreshToken, "Bearer", 900000, userSummary, orgSummary);
    }

    @Transactional
    public OrgSummary updateAutonomyMode(UUID orgId, String newMode) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        if (!List.of("ADVISOR", "CREATOR", "OPERATOR", "AUTOPILOT").contains(newMode.toUpperCase())) {
            throw new BusinessRuleException("Invalid autonomy mode: " + newMode);
        }

        org.setAutonomyMode(newMode.toUpperCase());
        org = organizationRepository.save(org);

        return new OrgSummary(org.getId(), org.getName(), org.getSlug(), org.getTier(), org.getAutonomyMode(), "UPDATED");
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getAiConfig(UUID orgId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        boolean geminiConfigured = org.getGeminiApiKey() != null && !org.getGeminiApiKey().isBlank();
        boolean claudeConfigured = org.getClaudeApiKey() != null && !org.getClaudeApiKey().isBlank();
        boolean openaiConfigured = org.getOpenaiApiKey() != null && !org.getOpenaiApiKey().isBlank();

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("geminiConfigured", geminiConfigured || geminiAiProvider.isConfigured());
        result.put("hasCustomGeminiKey", geminiConfigured);
        result.put("geminiKeyMasked", maskKey(decryptKeySafely(org.getGeminiApiKey())));
        result.put("claudeConfigured", claudeConfigured || claudeAiProvider.isConfigured());
        result.put("hasCustomClaudeKey", claudeConfigured);
        result.put("claudeKeyMasked", maskKey(decryptKeySafely(org.getClaudeApiKey())));
        result.put("openaiConfigured", openaiConfigured || openAiProvider.isConfigured());
        result.put("hasCustomOpenaiKey", openaiConfigured);
        result.put("openaiKeyMasked", maskKey(decryptKeySafely(org.getOpenaiApiKey())));
        result.put("preferredProvider", org.getPreferredAiProvider() != null ? org.getPreferredAiProvider() : "GEMINI");
        result.put("brandVoicePrompt", org.getBrandVoicePrompt() != null ? org.getBrandVoicePrompt() : "");
        return result;
    }

    @Transactional
    public java.util.Map<String, Object> updateAiConfig(UUID orgId, java.util.Map<String, String> body) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        String geminiKey = body.get("geminiApiKey");
        if (geminiKey != null && !geminiKey.isBlank() && !geminiKey.contains("...")) {
            org.setGeminiApiKey(encryptKey(geminiKey));
        }

        String claudeKey = body.get("claudeApiKey");
        if (claudeKey != null && !claudeKey.isBlank() && !claudeKey.contains("...")) {
            org.setClaudeApiKey(encryptKey(claudeKey));
        }

        String openaiKey = body.get("openaiApiKey");
        if (openaiKey != null && !openaiKey.isBlank() && !openaiKey.contains("...")) {
            org.setOpenaiApiKey(encryptKey(openaiKey));
        }

        String preferred = body.get("preferredProvider");
        if (preferred != null && !preferred.isBlank()) {
            org.setPreferredAiProvider(preferred.toUpperCase());
        }

        String brandVoice = body.get("brandVoicePrompt");
        if (brandVoice != null) {
            org.setBrandVoicePrompt(brandVoice);
        }

        organizationRepository.save(org);
        return getAiConfig(orgId);
    }

    public java.util.Map<String, Object> testAiConnection(UUID orgId, String provider, String apiKeyOverride) {
        String effectiveKey = apiKeyOverride;
        if ((effectiveKey == null || effectiveKey.isBlank() || effectiveKey.contains("...")) && orgId != null) {
            Organization org = organizationRepository.findById(orgId).orElse(null);
            if (org != null) {
                if ("CLAUDE".equalsIgnoreCase(provider)) {
                    effectiveKey = decryptKeySafely(org.getClaudeApiKey());
                } else if ("OPENAI".equalsIgnoreCase(provider)) {
                    effectiveKey = decryptKeySafely(org.getOpenaiApiKey());
                } else {
                    effectiveKey = decryptKeySafely(org.getGeminiApiKey());
                }
            }
        }

        com.omniagent.modules.ai.provider.AiProvider ai = "CLAUDE".equalsIgnoreCase(provider) ? claudeAiProvider
                : "OPENAI".equalsIgnoreCase(provider) ? openAiProvider : geminiAiProvider;

        var result = ai.generateText("You are an API health checker.", "Respond with: OK", effectiveKey);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        if (result.success()) {
            response.put("success", true);
            response.put("provider", provider);
            response.put("model", result.modelUsed());
            response.put("message", "Muvaffaqiyatli! AI javob berdi: " + (result.content() != null ? result.content().trim() : "OK"));
        } else {
            response.put("success", false);
            response.put("provider", provider);
            response.put("error", result.errorMessage());
        }
        return response;
    }

    private String encryptKey(String plaintext) {
        if (plaintext == null || plaintext.isBlank()) return null;
        var payload = tokenVaultService.encrypt(plaintext.trim());
        return payload != null ? java.util.Base64.getEncoder().encodeToString(payload.ciphertext()) : null;
    }

    private String decryptKeySafely(String encryptedOrPlain) {
        if (encryptedOrPlain == null || encryptedOrPlain.isBlank()) return null;
        try {
            byte[] bytes = java.util.Base64.getDecoder().decode(encryptedOrPlain);
            String decrypted = tokenVaultService.decrypt(bytes);
            return decrypted != null ? decrypted : encryptedOrPlain;
        } catch (Exception e) {
            return encryptedOrPlain;
        }
    }

    private String maskKey(String key) {
        if (key == null || key.length() < 10) return null;
        return key.substring(0, 7) + "..." + key.substring(key.length() - 4);
    }
}
