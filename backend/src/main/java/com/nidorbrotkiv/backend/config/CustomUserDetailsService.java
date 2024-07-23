package com.nidorbrotkiv.backend.config;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public interface CustomUserDetailsService extends UserDetailsService {
    UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;
    UserDetails loadUserByDetails(String username, String name, String profileImageUrl) throws UsernameNotFoundException;
}
