package com.jayashree.util;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.function.Predicate;

/** Small string helpers shared by the services. */
public final class Text {

    private Text() {}

    /** Trimmed text, or null when blank. */
    public static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.strip();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /** "Jayashree Villa Homes, Phase 2" -> "jayashree-villa-homes-phase-2". */
    public static String slugify(String value) {
        String ascii = Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replace("&", " and ")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");
        if (ascii.length() > 150) {
            ascii = ascii.substring(0, 150).replaceAll("-+$", "");
        }
        return ascii.isEmpty() ? "item" : ascii;
    }

    /** First free slug among base, base-2, base-3... */
    public static String uniqueSlug(String base, Predicate<String> taken) {
        String candidate = base;
        for (int n = 2; taken.test(candidate); n++) {
            candidate = base + "-" + n;
        }
        return candidate;
    }

    /** Lower-cased "%term%" for LIKE searches, or null for no filter. */
    public static String likePattern(String query) {
        String q = clean(query);
        return q == null ? null : "%" + q.toLowerCase(Locale.ROOT) + "%";
    }

    /** Non-blank, trimmed list entries. */
    public static List<String> cleanList(List<String> values) {
        return values == null ? List.of() : values.stream().map(Text::clean).filter(Objects::nonNull).toList();
    }

    /** "IMG_2034 front-view.jpg" -> "Img 2034 Front View". */
    public static String titleFromFilename(String filename) {
        String base = clean(filename);
        if (base == null) {
            return "Photo";
        }
        int dot = base.lastIndexOf('.');
        if (dot > 0) {
            base = base.substring(0, dot);
        }
        base = base.replaceAll("[_\\-.]+", " ").replaceAll("\\s+", " ").strip();
        if (base.isEmpty()) {
            return "Photo";
        }
        StringBuilder out = new StringBuilder();
        for (String word : base.split(" ")) {
            out.append(Character.toUpperCase(word.charAt(0))).append(word.substring(1).toLowerCase(Locale.ROOT)).append(' ');
        }
        String title = out.toString().strip();
        return title.length() > 150 ? title.substring(0, 150) : title;
    }

    /** Digits only, e.g. "+91 75582 98818" -> "917558298818". */
    public static String digits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }
}
