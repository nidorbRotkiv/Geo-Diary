package com.nidorbrotkiv.backend.config;

import com.nidorbrotkiv.backend.user.User;
import com.nidorbrotkiv.backend.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsServiceImpl implements CustomUserDetailsService {
    private final UserRepository userRepository;

    @Autowired
    public CustomUserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    @Override
    public UserDetails loadUserByDetails(String username, String name, String profileImageUrl) throws UsernameNotFoundException {
        return userRepository.findByEmail(username)
                .map(user -> updateUserDetails(user, name, profileImageUrl))
                .orElseGet(() -> createUser(username, name, profileImageUrl));
    }

    private User updateUserDetails(User user, String name, String profileImageUrl) {
        user.setName(name);
        user.setProfileImageUrl(profileImageUrl);
        userRepository.save(user);
        return user;
    }

    private User createUser(String username, String name, String profileImageUrl) {
        User newUser = new User();
        newUser.setEmail(username);
        newUser.setName(name);
        newUser.setProfileImageUrl(profileImageUrl);
        userRepository.save(newUser);
        return newUser;
    }
}
