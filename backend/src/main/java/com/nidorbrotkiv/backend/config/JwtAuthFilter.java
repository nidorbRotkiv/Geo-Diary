package com.nidorbrotkiv.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtValidationException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private static final Log logger = LogFactory.getLog(JwtAuthFilter.class);
    private final CustomUserDetailsService userDetailsService;
    private static final int BEARER_PREFIX_LENGTH = 7;
    private final JwtDecoder jwtDecoder;

    @Value("${allowed.emails}")
    private String allowedEmails;

    public JwtAuthFilter(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
        this.jwtDecoder = JwtDecoders.fromOidcIssuerLocation("https://accounts.google.com");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(BEARER_PREFIX_LENGTH);
            try {
                var jwt = jwtDecoder.decode(token);
                String email = jwt.getClaimAsString("email");
                List<String> allowedEmailsList = Arrays.asList(allowedEmails.split(","));
                if (!allowedEmailsList.contains(email)) {
                    logger.error("Unauthorized email: " + email);
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid: Unauthorized email");
                    return;
                }
                String name = jwt.getClaimAsString("name");
                String profileImageUrl = jwt.getClaimAsString("picture");

                UserDetails userDetails = userDetailsService.loadUserByDetails(email, name, profileImageUrl);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (JwtValidationException e) {
                logger.error("JWT Validation Failed: " + e.getMessage(), e);
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT Token");
                return;
            } catch (UsernameNotFoundException e) {
                logger.error("User Not Found: " + e.getMessage(), e);
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not found");
                return;
            } catch (Exception e) {
                logger.error("Authentication Error: " + e.getMessage(), e);
                throw new RuntimeException("Error in JwtAuthFilter", e);
            }
        }
        filterChain.doFilter(request, response);
    }
}