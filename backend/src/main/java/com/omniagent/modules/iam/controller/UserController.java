package com.omniagent.modules.iam.controller;

import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.modules.iam.domain.User;
import com.omniagent.modules.iam.dto.AuthDtos.UpdateProfileRequest;
import com.omniagent.modules.iam.dto.AuthDtos.UserSummary;
import com.omniagent.modules.iam.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UserSummary> getMyProfile(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(new UserSummary(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getLocale(),
                user.getEmailVerified()
        ));
    }

    @PatchMapping("/me")
    @Transactional
    public ResponseEntity<UserSummary> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        UUID userId = UUID.fromString(authentication.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl().trim());
        }
        if (request.locale() != null && !request.locale().isBlank()) {
            user.setLocale(request.locale().trim().toLowerCase());
        }

        user = userRepository.save(user);

        return ResponseEntity.ok(new UserSummary(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getLocale(),
                user.getEmailVerified()
        ));
    }
}
