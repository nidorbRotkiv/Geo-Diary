package com.nidorbrotkiv.backend.marker;

import java.text.Normalizer;

public class StringSanitizer {
    private static final String REGEX = "[^\\p{L}\\p{N}\\p{P}\\p{Z}]";

    public static String sanitizeAndCheckLength(String input, int maxLength) {
        if (input == null) {
            return null;
        }

        String sanitized = Normalizer.normalize(input, Normalizer.Form.NFD);

        sanitized = sanitized.replaceAll(REGEX, "").trim();

        if (sanitized.length() > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }

        return sanitized;
    }
}
