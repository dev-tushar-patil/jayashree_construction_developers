package com.jayashree.controller;

import com.jayashree.dto.AuthDtos.AdminProfile;
import com.jayashree.dto.AuthDtos.ChangePasswordRequest;
import com.jayashree.dto.AuthDtos.LoginRequest;
import com.jayashree.dto.AuthDtos.LoginResponse;
import com.jayashree.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/api/auth/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return auth.login(request);
    }

    /**
     * Tokens are stateless, so signing out happens in the browser by discarding the token; this endpoint exists
     * so clients have one place to call. Changing the password is what revokes every outstanding token.
     */
    @PostMapping("/api/auth/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/auth/me")
    public AdminProfile me(@AuthenticationPrincipal Jwt jwt) {
        return auth.profile(jwt.getSubject());
    }

    @PutMapping("/api/admin/account/password")
    public LoginResponse changePassword(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ChangePasswordRequest request) {
        return auth.changePassword(jwt.getSubject(), request);
    }
}
