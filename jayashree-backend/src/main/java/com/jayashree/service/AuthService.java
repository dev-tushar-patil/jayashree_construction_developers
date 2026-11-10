package com.jayashree.service;

import com.jayashree.config.AppProperties;
import com.jayashree.dto.AuthDtos.AdminProfile;
import com.jayashree.dto.AuthDtos.ChangePasswordRequest;
import com.jayashree.dto.AuthDtos.LoginRequest;
import com.jayashree.dto.AuthDtos.LoginResponse;
import com.jayashree.entity.AdminUser;
import com.jayashree.exception.ApiException;
import com.jayashree.repository.AdminUserRepository;
import com.jayashree.security.SecurityConfig;
import com.jayashree.security.TokenVersionValidator;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class AuthService {

    private final AdminUserRepository admins;
    private final PasswordEncoder encoder;
    private final JwtEncoder jwtEncoder;
    private final AppProperties properties;
    /** Compared against when the login is unknown, so response time doesn't reveal which accounts exist. */
    private final String dummyHash;

    public AuthService(AdminUserRepository admins, PasswordEncoder encoder, JwtEncoder jwtEncoder,
                       AppProperties properties) {
        this.admins = admins;
        this.encoder = encoder;
        this.jwtEncoder = jwtEncoder;
        this.properties = properties;
        this.dummyHash = encoder.encode("not-a-real-password");
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        AdminUser admin = admins.findByLogin(request.login().strip()).filter(AdminUser::isActive).orElse(null);
        boolean matches = encoder.matches(request.password(), admin == null ? dummyHash : admin.getPasswordHash());
        if (admin == null || !matches) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect username/email or password.");
        }
        admin.setLastLoginAt(Instant.now());
        return issueToken(admin);
    }

    @Transactional(readOnly = true)
    public AdminProfile profile(String username) {
        return admins.findByUsernameIgnoreCase(username).filter(AdminUser::isActive)
                .map(AuthService::toProfile)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please sign in again."));
    }

    /** Changing the password ends every other session; the caller gets a fresh token to stay signed in. */
    @Transactional
    public LoginResponse changePassword(String username, ChangePasswordRequest request) {
        AdminUser admin = admins.findByUsernameIgnoreCase(username).filter(AdminUser::isActive)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please sign in again."));
        if (!encoder.matches(request.currentPassword(), admin.getPasswordHash())) {
            throw ApiException.badRequest("Your current password is not correct.");
        }
        if (request.currentPassword().equals(request.newPassword())) {
            throw ApiException.badRequest("The new password must be different from the current one.");
        }
        admin.setPasswordHash(encoder.encode(request.newPassword()));
        admin.setTokenVersion(admin.getTokenVersion() + 1);
        return issueToken(admin);
    }

    private LoginResponse issueToken(AdminUser admin) {
        Instant now = Instant.now();
        Instant expires = now.plus(Duration.ofHours(properties.jwt().expiryHours()));
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(TokenVersionValidator.ISSUER)
                .subject(admin.getUsername())
                .issuedAt(now)
                .expiresAt(expires)
                .claim(SecurityConfig.ROLES_CLAIM, List.of(admin.getRole().name()))
                .claim(TokenVersionValidator.VERSION_CLAIM, admin.getTokenVersion())
                .build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new LoginResponse(token, expires, toProfile(admin));
    }

    private static AdminProfile toProfile(AdminUser admin) {
        return new AdminProfile(admin.getUsername(), admin.getEmail(), admin.getDisplayName(), admin.getRole().name());
    }
}
