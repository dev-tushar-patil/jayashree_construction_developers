package com.jayashree.service.storage;

import com.jayashree.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.YearMonth;
import java.util.UUID;

/** Stores files on this server's disk under UPLOAD_DIR/yyyy/MM/, served by WebConfig at UPLOAD_PUBLIC_BASE_URL. */
@Service
@ConditionalOnProperty(prefix = "jayashree.storage", name = "type", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    private final Path root;
    private final String publicBase;

    public LocalStorageService(AppProperties properties) throws IOException {
        this.root = Path.of(properties.storage().uploadDir()).toAbsolutePath().normalize();
        String base = properties.storage().publicBaseUrl();
        this.publicBase = base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
        Files.createDirectories(root);
    }

    @Override
    public String save(byte[] content, String extension) {
        YearMonth month = YearMonth.now();
        String relative = "%d/%02d/%s.%s".formatted(month.getYear(), month.getMonthValue(), UUID.randomUUID(), extension);
        Path target = root.resolve(relative).normalize();
        try {
            Files.createDirectories(target.getParent());
            Files.write(target, content);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not store upload", e);
        }
        return publicBase + "/" + relative;
    }

    @Override
    public void delete(String url) {
        if (url == null || !url.startsWith(publicBase + "/")) {
            return;
        }
        Path target = root.resolve(url.substring(publicBase.length() + 1)).normalize();
        if (!target.startsWith(root) || target.equals(root)) {
            return; // never follow ../ out of the upload folder
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            log.warn("Could not delete upload {}: {}", target, e.getMessage());
        }
    }
}
