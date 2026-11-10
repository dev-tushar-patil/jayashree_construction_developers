package com.jayashree.security;

import com.jayashree.repository.AdminUserRepository;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Rejects a token whose admin no longer exists, is deactivated, or has changed password since it was issued.
 * This is what makes "change password" sign out every other device.
 */
@Component
public class TokenVersionValidator implements OAuth2TokenValidator<Jwt> {

    public static final String ISSUER = "jayashree";
    public static final String VERSION_CLAIM = "ver";

    private static final OAuth2Error REVOKED = new OAuth2Error("invalid_token", "Session has ended. Please sign in again.", null);

    private final AdminUserRepository admins;

    public TokenVersionValidator(AdminUserRepository admins) {
        this.admins = admins;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        Object claim = token.getClaim(VERSION_CLAIM);
        if (!(claim instanceof Number version)) {
            return OAuth2TokenValidatorResult.failure(REVOKED);
        }
        boolean valid = admins.findByUsernameIgnoreCase(token.getSubject())
                .filter(a -> a.isActive() && a.getTokenVersion() == version.intValue())
                .isPresent();
        return valid ? OAuth2TokenValidatorResult.success() : OAuth2TokenValidatorResult.failure(REVOKED);
    }
}
