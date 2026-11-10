package com.omniagent.modules.iam.domain;

import com.omniagent.common.domain.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "organizations")
public class Organization extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "tier", nullable = false)
    private String tier = "FREE"; // FREE, CREATOR, PRO, BUSINESS, ENTERPRISE

    @Column(name = "autonomy_mode", nullable = false)
    private String autonomyMode = "OPERATOR"; // ADVISOR, CREATOR, OPERATOR, AUTOPILOT

    @Column(name = "gemini_api_key")
    private String geminiApiKey;

    @Column(name = "claude_api_key")
    private String claudeApiKey;

    @Column(name = "openai_api_key")
    private String openaiApiKey;

    @Column(name = "preferred_ai_provider")
    private String preferredAiProvider = "GEMINI";

    @Column(name = "brand_voice_prompt")
    private String brandVoicePrompt;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    public String getAutonomyMode() {
        return autonomyMode;
    }

    public void setAutonomyMode(String autonomyMode) {
        this.autonomyMode = autonomyMode;
    }

    public String getGeminiApiKey() {
        return geminiApiKey;
    }

    public void setGeminiApiKey(String geminiApiKey) {
        this.geminiApiKey = geminiApiKey;
    }

    public String getClaudeApiKey() {
        return claudeApiKey;
    }

    public void setClaudeApiKey(String claudeApiKey) {
        this.claudeApiKey = claudeApiKey;
    }

    public String getOpenaiApiKey() {
        return openaiApiKey;
    }

    public void setOpenaiApiKey(String openaiApiKey) {
        this.openaiApiKey = openaiApiKey;
    }

    public String getPreferredAiProvider() {
        return preferredAiProvider;
    }

    public void setPreferredAiProvider(String preferredAiProvider) {
        this.preferredAiProvider = preferredAiProvider;
    }

    public String getBrandVoicePrompt() {
        return brandVoicePrompt;
    }

    public void setBrandVoicePrompt(String brandVoicePrompt) {
        this.brandVoicePrompt = brandVoicePrompt;
    }
}
