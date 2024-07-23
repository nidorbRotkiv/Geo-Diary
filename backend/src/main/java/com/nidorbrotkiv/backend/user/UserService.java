package com.nidorbrotkiv.backend.user;

import com.nidorbrotkiv.backend.follow.FollowRequest;
import com.nidorbrotkiv.backend.follow.FollowRequestRepository;
import com.nidorbrotkiv.backend.marker.MarkerRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final FollowRequestRepository followRequestRepository;
    private final MarkerRepository markerRepository;

    @Autowired
    public UserService(UserRepository userRepository, FollowRequestRepository followRequestRepository, MarkerRepository markerRepository) {
        this.userRepository = userRepository;
        this.followRequestRepository = followRequestRepository;
        this.markerRepository = markerRepository;
    }

    public User getUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new NoSuchElementException("No user with that email"));
    }

    @Transactional
    public boolean addNewUser(User user) {
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            if (existingUser.get().getUsername().isEmpty() || existingUser.get().getUsername() == null) {
                existingUser.get().setName(user.getName());
                existingUser.get().setProfileImageUrl(user.getProfileImageUrl());
            }
        }
        userRepository.save(user);
        return true;
    }

    @Transactional
    public FollowRequest createFollowRequest(String targetEmail, String requesterEmail) {
        if (targetEmail.equals(requesterEmail)) {
            throw new IllegalStateException("Same user can't follow itself");
        }
        User target = userRepository.findByEmail(targetEmail)
                .orElseThrow(() -> new NoSuchElementException("Target user not found"));
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new NoSuchElementException("Requester user not found"));

        if (requester.getFollowRequests().stream().anyMatch(r -> r.getTarget().equals(target))) {
            throw new IllegalStateException("Follow request already exists");
        }

        FollowRequest followRequest = new FollowRequest(requester, target, "pending");
        followRequestRepository.save(followRequest);

        requester.getFollowRequests().add(followRequest);
        target.addReceivedFollowRequest(followRequest);
        return followRequest;
    }


    @Transactional
    public void unfollow(String targetEmail, String requesterEmail) {
        User target = userRepository.findByEmail(targetEmail)
                .orElseThrow(() -> new NoSuchElementException("Target user not found"));
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new NoSuchElementException("Requester user not found"));

        if (!requester.getFollowing().contains(target)) {
            throw new NoSuchElementException("User does not follow this user");
        }

        requester.getFollowing().remove(target);
        target.getFollowers().remove(requester);

        userRepository.save(requester);
        userRepository.save(target);
    }

    @Transactional
    public void acceptFollowRequest(Long followRequestId) {
        FollowRequest followRequest = followRequestRepository.findById(followRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Follow request not found"));

        User requester = followRequest.getRequester();
        User target = followRequest.getTarget();

        requester.getFollowRequests().remove(followRequest);
        target.getFollowRequests().remove(followRequest);

        target.getFollowers().add(requester);
        requester.getFollowing().add(target);

        followRequestRepository.delete(followRequest);

        userRepository.save(requester);
        userRepository.save(target);
    }

    @Transactional
    public void cancelFollowRequest(Long followRequestId) {
        FollowRequest followRequest = followRequestRepository.findById(followRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Follow request not found"));

        User requester = followRequest.getRequester();
        User target = followRequest.getTarget();

        requester.getFollowRequests().remove(followRequest);
        target.getFollowRequests().remove(followRequest);

        followRequestRepository.delete(followRequest);

        userRepository.save(requester);
        userRepository.save(target);
    }

    @Transactional
    public boolean deleteUser(String email) {
        try {
            Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                User user = existingUser.get();

                user.removeAllFollowersAndFollowing();
                user.removeAllFollowRequestsAndFollowerRequests();
                markerRepository.deleteAll(markerRepository.findOnlyOwnedMarkersByOwnerEmail(user.getEmail()));
                markerRepository.findByViewerEmail(user.getEmail()).forEach(marker -> marker.removeViewer(user));
                userRepository.delete(user);
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}
