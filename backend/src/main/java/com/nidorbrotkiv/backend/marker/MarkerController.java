package com.nidorbrotkiv.backend.marker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/markers")
public class MarkerController {

    private final MarkerService markerService;
    private static final Logger logger = LoggerFactory.getLogger(MarkerController.class);

    @Autowired
    public MarkerController(MarkerService markerService) {
        this.markerService = markerService;
    }

    @GetMapping("/user")
    public ResponseEntity<List<Marker>> getMarkers(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Marker> markers = markerService.getMarkers(userDetails.getUsername());
            return ResponseEntity.ok(markers);
        } catch (NoSuchElementException e) {
            logger.error("Error fetching markers for user: {}", userDetails.getUsername(), e);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Markers not found for user: " + userDetails.getUsername(), e);
        }
    }


    @PostMapping("/user")
    public ResponseEntity<Long> addMarker(@RequestBody Marker marker, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            long markerId = markerService.addMarker(userDetails.getUsername(), marker);
            return ResponseEntity.status(HttpStatus.CREATED).body(markerId);
        } catch (Exception e) {
            logger.error("Error adding marker for user: {}", userDetails.getUsername(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error adding marker for user: " + userDetails.getUsername(), e);
        }
    }

    @PostMapping("/{markerId}/images")
    public ResponseEntity<Map<String, String>> uploadImageToMarker(@PathVariable Long markerId, @RequestParam("image") MultipartFile imageFile) {
        try {
            String imageUrl = markerService.addImage(markerId, imageFile);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (IOException e) {
            logger.error("Error uploading image for marker: {}", markerId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload image", e);
        }
    }

    @DeleteMapping("/images")
    public ResponseEntity<String> deleteImage(@RequestParam("imageUrl") String imageUrl) {
        try {
            markerService.deleteImage(imageUrl);
            return ResponseEntity.ok("Image deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting image: {}", imageUrl, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete image: " + e.getMessage(), e);
        }
    }

    @PatchMapping("/user/{markerId}/title")
    public ResponseEntity<String> updateMarkerTitle(@PathVariable long markerId, @RequestParam("title") String title) {
        try {
            markerService.updateMarkerTitle(markerId, title);
            return ResponseEntity.ok("Title updated successfully");
        } catch (Exception e) {
            logger.error("Error updating title for marker: {}", markerId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update title", e);
        }
    }

    @PatchMapping("/user/{markerId}/description")
    public ResponseEntity<String> updateMarkerDescription(@PathVariable long markerId, @RequestParam("description") String description) {
        try {
            markerService.updateMarkerDescription(markerId, description);
            return ResponseEntity.ok("Description updated successfully");
        } catch (Exception e) {
            logger.error("Error updating description for marker: {}", markerId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update description", e);
        }
    }

    @PatchMapping("/user/{markerId}/category")
    public ResponseEntity<String> updateMarkerCategory(@PathVariable long markerId, @RequestParam("category") String category) {
        try {
            markerService.updateMarkerCategory(markerId, category);
            return ResponseEntity.ok("Category updated successfully");
        } catch (Exception e) {
            logger.error("Error updating category for marker: {}", markerId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update category", e);
        }
    }

    @PatchMapping("/user/{markerId}/isPublic")
    public ResponseEntity<String> updateMarkerIsPublic(@PathVariable long markerId, @RequestParam("isPublic") Boolean isPublic) {
        try {
            markerService.updateMarkerIsPublic(markerId, isPublic);
            return ResponseEntity.ok("Public status updated successfully");
        } catch (Exception e) {
            logger.error("Error updating public status for marker: {}", markerId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update public status", e);
        }
    }

    @DeleteMapping("/user/{markerId}")
    public ResponseEntity<String> deleteMarker(@AuthenticationPrincipal UserDetails userDetails, @PathVariable long markerId) {
        try {
            markerService.deleteMarker(userDetails.getUsername(), markerId);
            return ResponseEntity.ok("Marker deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting marker: {}", markerId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete marker", e);
        }
    }
}
