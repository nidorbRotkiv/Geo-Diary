package com.nidorbrotkiv.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtException;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api")
public class TokenValidationController {

    @PostMapping("/validateToken")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                JwtDecoder jwtDecoder = JwtDecoders.fromOidcIssuerLocation("https://accounts.google.com");
                Jwt jwt = jwtDecoder.decode(token);

                long expiryTimestamp = Objects.requireNonNull(jwt.getExpiresAt()).toEpochMilli();
                long currentTimestamp = System.currentTimeMillis();
                long timeUntilExpiry = expiryTimestamp - currentTimestamp;

                Map<String, Object> responseBody = new HashMap<>();
                if (timeUntilExpiry > 0) {
                    responseBody.put("message", "Token is valid.");
                    responseBody.put("timeUntilExpiration", timeUntilExpiry);
                    return ResponseEntity.ok(responseBody);
                }
            } catch (JwtException e) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid token: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
        }
        Map<String, String> error = new HashMap<>();
        error.put("error", "Authorization header is missing or does not start with Bearer.");
        return ResponseEntity.badRequest().body(error);
    }
}

