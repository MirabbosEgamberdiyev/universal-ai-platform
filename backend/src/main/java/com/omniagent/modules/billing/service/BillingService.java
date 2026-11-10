package com.omniagent.modules.billing.service;

import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.modules.iam.domain.Organization;
import com.omniagent.modules.iam.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class BillingService {

    private final OrganizationRepository organizationRepository;

    public BillingService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    public List<SubscriptionPlan> getAvailablePlans() {
        return List.of(
                new SubscriptionPlan("FREE", "Free Tier", BigDecimal.ZERO, "USD", 2, 50000, 1, List.of("2 Social Accounts", "50k AI Tokens/mo", "Basic Content Studio")),
                new SubscriptionPlan("CREATOR", "Creator Pro", BigDecimal.valueOf(19.00), "USD", 5, 500000, 1, List.of("5 Social Accounts", "500k AI Tokens/mo", "Full Visual Calendar", "AI Content Studio")),
                new SubscriptionPlan("PRO", "Agency Pro", BigDecimal.valueOf(49.00), "USD", 15, 2000000, 3, List.of("15 Social Accounts", "2M AI Tokens/mo", "Unified Inbox", "Mode 3 Approval Engine", "Automation Canvas")),
                new SubscriptionPlan("BUSINESS", "Enterprise Business", BigDecimal.valueOf(129.00), "USD", 35, 6000000, 10, List.of("35 Accounts", "6M Tokens/mo", "Full CRM & Productivity", "Priority AI Dispatch"))
        );
    }

    @Transactional(readOnly = true)
    public OrganizationSubscriptionStatus getSubscriptionStatus(UUID orgId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return new OrganizationSubscriptionStatus(
                org.getId(),
                org.getTier(),
                "ACTIVE",
                124000, // Tokens used this month
                500000, // Token limit
                28,     // Posts published
                100     // Post limit
        );
    }

    @Transactional
    public CheckoutSessionResponse createCheckoutSession(UUID orgId, String planCode, String provider) {
        // Generates sandbox / real checkout redirect URL
        String redirectUrl;
        if ("PAYME".equalsIgnoreCase(provider)) {
            redirectUrl = "https://checkout.test.paycom.uz/checkout?merchant_id=sandbox_omni&plan=" + planCode + "&org=" + orgId;
        } else if ("CLICK".equalsIgnoreCase(provider)) {
            redirectUrl = "https://my.click.uz/services/pay?service_id=sandbox_omni&plan=" + planCode + "&org=" + orgId;
        } else {
            redirectUrl = "https://checkout.stripe.com/c/pay/cs_test_omniagent_" + planCode.toLowerCase();
        }

        return new CheckoutSessionResponse(provider.toUpperCase(), planCode.toUpperCase(), redirectUrl);
    }

    public record SubscriptionPlan(
            String code,
            String name,
            BigDecimal monthlyPrice,
            String currency,
            int maxAccounts,
            long aiTokenQuota,
            int includedSeats,
            List<String> features
    ) {}

    public record OrganizationSubscriptionStatus(
            UUID organizationId,
            String currentTier,
            String status,
            long tokensUsedThisMonth,
            long monthlyTokenQuota,
            int postsPublishedThisMonth,
            int monthlyPostQuota
    ) {}

    public record CheckoutSessionResponse(
            String provider,
            String planCode,
            String checkoutUrl
    ) {}
}
