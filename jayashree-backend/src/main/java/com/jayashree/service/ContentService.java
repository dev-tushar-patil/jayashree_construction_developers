package com.jayashree.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayashree.entity.SiteContent;
import com.jayashree.exception.ApiException;
import com.jayashree.repository.SiteContentRepository;
import com.jayashree.service.ContentDefaults.Entry;
import com.jayashree.service.storage.StorageService;
import com.jayashree.util.Text;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Editable website content, contact details, social links and SEO text. Read on every page view, so the merged
 * map is cached in memory and rebuilt after each admin save.
 */
@Service
public class ContentService {

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final int MAX_VALUE_LENGTH = 10_000;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final SiteContentRepository repository;
    private final StorageService storage;
    private volatile Map<String, String> cache;

    public ContentService(SiteContentRepository repository, StorageService storage) {
        this.repository = repository;
        this.storage = storage;
    }

    /** Every key with its current value (saved value, else default). */
    @Transactional(readOnly = true)
    public Map<String, String> all() {
        Map<String, String> current = cache;
        if (current == null) {
            Map<String, String> merged = new LinkedHashMap<>();
            ContentDefaults.ENTRIES.forEach((key, entry) -> merged.put(key, entry.value()));
            repository.findAll().forEach(row -> {
                if (merged.containsKey(row.getKey())) {
                    merged.put(row.getKey(), row.getValue() == null ? "" : row.getValue());
                }
            });
            current = Collections.unmodifiableMap(merged);
            cache = current;
        }
        return current;
    }

    /** Saves the given keys only; unknown keys are refused so typos never silently disappear. */
    @Transactional
    public Map<String, String> update(Map<String, String> changes) {
        if (changes == null || changes.isEmpty()) {
            return all();
        }
        Map<String, String> before = all();
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        Map<String, String> cleaned = new LinkedHashMap<>();
        changes.forEach((key, raw) -> {
            Entry entry = ContentDefaults.ENTRIES.get(key);
            if (entry == null) {
                fieldErrors.put(key, "Unknown setting.");
                return;
            }
            String value = raw == null ? "" : raw.strip();
            String error = validate(entry, value);
            if (error != null) {
                fieldErrors.put(key, error);
            } else {
                cleaned.put(key, entry.kind() == ContentDefaults.Kind.PHONE ? normalisePhone(key, value) : value);
            }
        });
        if (!fieldErrors.isEmpty()) {
            throw new ContentValidationException(fieldErrors);
        }
        cleaned.forEach((key, value) -> {
            SiteContent row = repository.findById(key)
                    .orElseGet(() -> new SiteContent(key, ContentDefaults.ENTRIES.get(key).section(), null));
            row.setValue(value);
            repository.save(row);
        });
        repository.flush();
        cache = null;
        // Cleared again after commit, in case a concurrent read re-cached the old values in between.
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    cache = null;
                }
            });
        }
        // Replaced page images that were uploaded (not bundled) are removed from storage.
        cleaned.forEach((key, value) -> {
            if (ContentDefaults.ENTRIES.get(key).kind() == ContentDefaults.Kind.IMAGE) {
                String old = before.get(key);
                if (old != null && !old.equals(value)) {
                    storage.delete(old);
                }
            }
        });
        return all();
    }

    public String get(String key) {
        return all().getOrDefault(key, "");
    }

    private static String validate(Entry entry, String value) {
        if (value.length() > MAX_VALUE_LENGTH) {
            return "Too long.";
        }
        return switch (entry.kind()) {
            case URL -> value.isEmpty() || value.matches("^https://\\S+$") ? null : "Use a full link starting with https://";
            case EMAIL -> value.isEmpty() || EMAIL.matcher(value).matches() ? null : "Enter a valid email address.";
            case PHONE -> value.isEmpty() || Text.digits(value).length() >= 10 && Text.digits(value).length() <= 15
                    ? null : "Enter a phone number with 10 to 15 digits.";
            case IMAGE -> value.isEmpty() || value.startsWith("/images/") || value.startsWith("/uploads/")
                    || value.startsWith("https://") ? null : "Upload an image.";
            case JSON_LIST -> validJsonList(value) ? null : "The list could not be read.";
            case TEXT -> null;
        };
    }

    /** WhatsApp needs the country code; a 10-digit Indian mobile gets 91 in front. Display phones keep their format. */
    private static String normalisePhone(String key, String value) {
        if (!key.equals("contact.whatsapp")) {
            return value;
        }
        String digits = Text.digits(value);
        return digits.length() == 10 ? "91" + digits : digits;
    }

    private static boolean validJsonList(String value) {
        if (value.isEmpty()) {
            return true;
        }
        try {
            List<Map<String, Object>> items = MAPPER.readValue(value, new TypeReference<>() {});
            return items.size() <= 20 && items.stream().allMatch(i -> i.get("title") instanceof String);
        } catch (Exception e) {
            return false;
        }
    }

    /** Field-level errors, surfaced like bean validation errors. */
    public static class ContentValidationException extends ApiException {
        private final Map<String, String> fieldErrors;

        public ContentValidationException(Map<String, String> fieldErrors) {
            super(org.springframework.http.HttpStatus.BAD_REQUEST, "Please correct the highlighted fields.");
            this.fieldErrors = fieldErrors;
        }

        public Map<String, String> getFieldErrors() {
            return fieldErrors;
        }
    }
}
