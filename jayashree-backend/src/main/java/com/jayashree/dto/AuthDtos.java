package com.jayashree.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class AuthDtos {

    private AuthDtos() {}

    /** login is the username or the email address. */
    public record LoginRequest(
            @NotBlank(message = "Please enter your username or email.") @Size(max = 160) String login,
            @NotBlank(message = "Please enter your password.") @Size(max = 200) String password) {}

    public record LoginResponse(String token, Instant expiresAt, AdminProfile admin) {}

    public record AdminProfile(String username, String email, String displayName, String role) {}

    public record ChangePasswordRequest(
            @NotBlank(message = "Please enter your current password.") String currentPassword,
            @NotBlank(message = "Please enter a new password.")
            @Size(min = 10, max = 100, message = "Use at least 10 characters.") String newPassword) {}
}
