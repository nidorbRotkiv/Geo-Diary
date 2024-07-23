package com.nidorbrotkiv.backend.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nidorbrotkiv.backend.follow.FollowRequest;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "app_user", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"email"})
})
@Data
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"followRequests", "followers", "following", "receivedFollowRequests"})
public class User implements UserDetails {
    public static final String USER_SEQUENCE = "user_sequence";

    @Id
    @SequenceGenerator(
            name = USER_SEQUENCE,
            sequenceName = USER_SEQUENCE,
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = USER_SEQUENCE
    )
    @EqualsAndHashCode.Include
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @OneToMany(mappedBy = "requester", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FollowRequest> followRequests = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "user_followers",
            joinColumns = @JoinColumn(name = "follower_id"),
            inverseJoinColumns = @JoinColumn(name = "following_id")
    )
    @JsonIgnore
    private Set<User> followers = new HashSet<>();

    @ManyToMany(mappedBy = "followers")
    @JsonIgnore
    private Set<User> following = new HashSet<>();

    @OneToMany(mappedBy = "target", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FollowRequest> receivedFollowRequests = new HashSet<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("USER"));
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public record FollowRequestDetails(Long id, String requesterEmail) {
    }

    @Transient
    @JsonProperty("receivedFollowRequests")
    public Set<FollowRequestDetails> getReceivedFollowRequestDetails() {
        return receivedFollowRequests.stream()
                .map(request -> new FollowRequestDetails(request.getId(), request.getRequester().getEmail()))
                .collect(Collectors.toSet());
    }

    public void addReceivedFollowRequest(FollowRequest followRequest) {
        receivedFollowRequests.add(followRequest);
    }

    @Transient
    @JsonProperty("followerEmails")
    public Set<String> getFollowerEmails() {
        return followers.stream().map(User::getEmail).collect(Collectors.toSet());
    }

    @Transient
    @JsonProperty("followingEmails")
    public Set<String> getFollowingEmails() {
        return following.stream().map(User::getEmail).collect(Collectors.toSet());
    }

    public void removeAllFollowersAndFollowing() {
        for (User follower : new HashSet<>(followers)) {
            follower.getFollowing().remove(this);
            followers.remove(follower);
        }
        for (User followed : new HashSet<>(following)) {
            followed.getFollowers().remove(this);
            following.remove(followed);
        }
    }

    public void removeAllFollowRequestsAndFollowerRequests() {
        for (FollowRequest followRequest : new HashSet<>(followRequests)) {
            followRequest.getRequester().getFollowRequests().remove(followRequest);
            followRequests.remove(followRequest);
        }

        for (FollowRequest receivedFollowRequest : new HashSet<>(receivedFollowRequests)) {
            receivedFollowRequest.getTarget().getReceivedFollowRequests().remove(receivedFollowRequest);
            receivedFollowRequests.remove(receivedFollowRequest);
        }
    }
}