package com.jayashree.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "jayashree")
public record AppProperties(
        List<String> corsAllowedOrigins,
        boolean seedSampleData,
        int rateLimitPerMinute,
        Storage storage,
        Images images,
        Jwt jwt,
        Admin admin) {

    public record Storage(String type, String uploadDir, String publicBaseUrl) {}

    public record Images(int maxDimension, int thumbnailWidth, float jpegQuality, long maxSourcePixels) {}

    public record Jwt(String secret, int expiryHours) {}

    public record Admin(String username, String email, String password) {}
}
