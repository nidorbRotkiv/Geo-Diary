package com.nidorbrotkiv.backend.user;

import com.nidorbrotkiv.backend.follow.FollowRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping(path = "api/user")
public class UserController {
    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<User> getUser(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.getUser(userDetails.getUsername());
            return ResponseEntity.ok(user);
        } catch (ResponseStatusException e) {
            logger.error("Failed to get user: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while getting user: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
        }
    }

    @DeleteMapping
    public ResponseEntity<String> deleteUser(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userService.deleteUser(userDetails.getUsername())) {
                return ResponseEntity.ok("User deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not delete user");
            }
        } catch (Exception e) {
            logger.error("Unexpected error while deleting user: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
        }
    }

    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody User user) {
        try {
            if (userService.addNewUser(user)) {
                return ResponseEntity.status(HttpStatus.CREATED).body("User created successfully");
            } else {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists");
            }
        } catch (Exception e) {
            logger.error("Unexpected error while creating user: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
        }
    }

    @PostMapping("/follow/{targetEmail}")
    public ResponseEntity<FollowRequest> followRequest(@PathVariable String targetEmail, @AuthenticationPrincipal UserDetails userDetails) {
        final String requesterEmail = userDetails.getUsername();
        try {
            FollowRequest followRequest = userService.createFollowRequest(targetEmail, requesterEmail);
            return ResponseEntity.ok(followRequest);
        } catch (ResponseStatusException e) {
            logger.error("Failed to send follow request: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while sending follow request: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
        }
    }

    @DeleteMapping("/unfollow/{targetEmail}")
    public ResponseEntity<String> unfollow(@PathVariable String targetEmail, @AuthenticationPrincipal UserDetails userDetails) {
        String requesterEmail = userDetails.getUsername();
        try {
            userService.unfollow(targetEmail, requesterEmail);
            return ResponseEntity.ok("Unfollowed successfully");
        } catch (ResponseStatusException e) {
            logger.error("Failed to unfollow: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while unfollowing: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
        }
    }

    @PostMapping("/accept/{followRequestId}")
    public ResponseEntity<String> acceptFollowRequest(@PathVariable Long followRequestId) {
        try {
            userService.acceptFollowRequest(followRequestId);
            return ResponseEntity.ok("Follow request accepted successfully");
        } catch (ResponseStatusException e) {
            logger.error("Failed to accept follow request: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while accepting follow request: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
        }
    }

    @DeleteMapping("/cancel/{followRequestId}")
    public ResponseEntity<String> declineFollowRequest(@PathVariable Long followRequestId) {
        try {
            userService.cancelFollowRequest(followRequestId);
            return ResponseEntity.ok("Follow request canceled successfully");
        } catch (ResponseStatusException e) {
            logger.error("Failed to cancel follow request: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while canceling follow request: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
        }
    }
}
