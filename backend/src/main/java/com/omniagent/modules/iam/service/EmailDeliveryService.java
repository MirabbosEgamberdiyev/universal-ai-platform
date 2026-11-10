package com.omniagent.modules.iam.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EmailDeliveryService {

    private static final Logger log = LoggerFactory.getLogger(EmailDeliveryService.class);

    @Value("${omniagent.frontend.base-url:http://localhost:3005}")
    private String frontendBaseUrl;

    @Value("${omniagent.mail.from:no-reply@novasphere.ai}")
    private String mailFrom;

    public void sendVerificationEmail(String toEmail, String fullName, String rawToken, String locale) {
        String verificationUrl = frontendBaseUrl + "/verify-email?token=" + rawToken;
        String lang = normalizeLocale(locale);

        String subject = switch (lang) {
            case "uzl" -> "Elektron pochtangizni tasdiqlang — OmniAgent / NovaSphere AI";
            case "uzc" -> "Электрон почтангизни тасдиқланг — OmniAgent / NovaSphere AI";
            case "ru" -> "Подтвердите ваш адрес электронной почты — OmniAgent / NovaSphere AI";
            default -> "Verify your email address — OmniAgent / NovaSphere AI";
        };

        String body = buildVerificationBody(fullName, verificationUrl, rawToken, lang);

        log.info("================================================================================");
        log.info("[EMAIL DISPATCH] Verification Email to: {}", toEmail);
        log.info("Subject: {}", subject);
        log.info("Locale: {}", lang);
        log.info("Verification URL: {}", verificationUrl);
        log.info("Raw Verification Token: {}", rawToken);
        log.info("================================================================================");
    }

    public void sendPasswordResetEmail(String toEmail, String fullName, String rawToken, String locale) {
        String resetUrl = frontendBaseUrl + "/reset-password?token=" + rawToken;
        String lang = normalizeLocale(locale);

        String subject = switch (lang) {
            case "uzl" -> "Parolni tiklash so'rovi — OmniAgent / NovaSphere AI";
            case "uzc" -> "Паролни тиклаш сўрови — OmniAgent / NovaSphere AI";
            case "ru" -> "Сброс пароля учетной записи — OmniAgent / NovaSphere AI";
            default -> "Password Reset Request — OmniAgent / NovaSphere AI";
        };

        log.info("================================================================================");
        log.info("[EMAIL DISPATCH] Password Reset Email to: {}", toEmail);
        log.info("Subject: {}", subject);
        log.info("Locale: {}", lang);
        log.info("Reset URL: {}", resetUrl);
        log.info("Raw Reset Token: {}", rawToken);
        log.info("================================================================================");
    }

    private String normalizeLocale(String loc) {
        if (loc == null) return "uzl";
        String lower = loc.toLowerCase().replace("-", "_");
        if (lower.startsWith("uz_c") || lower.equals("uzc")) return "uzc";
        if (lower.startsWith("uz") || lower.equals("uzl")) return "uzl";
        if (lower.startsWith("ru")) return "ru";
        return "en";
    }

    private String buildVerificationBody(String fullName, String url, String token, String lang) {
        return switch (lang) {
            case "uzl" -> String.format(
                    "Hurmatli %s,\n\nOmniAgent platformasiga xush kelibsiz! Hisobingizni faollashtirish uchun quyidagi havolani bosing:\n%s\n\nTasdiqlash kodingiz: %s\n\nAgar siz ushbu so'rovni yubormagan bo'lsangiz, xatni e'tiborsiz qoldiring.",
                    fullName, url, token);
            case "uzc" -> String.format(
                    "Ҳурматли %s,\n\nOmniAgent платформасига хуш келибсиз! Ҳисобингизни фаоллаштириш учун қуйидаги ҳаволани босинг:\n%s\n\nТасдиқлаш кодингиз: %s\n\nАгар сиз ушбу сўровни юбормаган бўлсангиз, хатни эътиборсиз қолдиринг.",
                    fullName, url, token);
            case "ru" -> String.format(
                    "Здравствуйте, %s!\n\nДобро пожаловать в OmniAgent. Для подтверждения учетной записи перейдите по ссылке:\n%s\n\nВаш проверочный токен: %s\n\nЕсли вы не запрашивали регистрацию, проигнорируйте это письмо.",
                    fullName, url, token);
            default -> String.format(
                    "Hello %s,\n\nWelcome to OmniAgent. Please verify your email by clicking the link below:\n%s\n\nVerification token: %s\n\nIf you did not make this request, you can safely ignore this email.",
                    fullName, url, token);
        };
    }
}
