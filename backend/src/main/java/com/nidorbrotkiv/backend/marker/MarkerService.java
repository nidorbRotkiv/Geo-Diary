package com.nidorbrotkiv.backend.marker;

import com.nidorbrotkiv.backend.bucket.GoogleCloudService;
import com.nidorbrotkiv.backend.user.User;
import com.nidorbrotkiv.backend.user.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.*;

import static com.nidorbrotkiv.backend.marker.StringSanitizer.sanitizeAndCheckLength;

@Service
public class MarkerService {
    private final static String BUCKET_NAME = "geo-diary-images";
    private final MarkerRepository markerRepository;
    private final UserRepository userRepository;
    private final ImageRepository imageRepository;
    private final GoogleCloudService googleCloudService;
    private static final Logger logger = LoggerFactory.getLogger(MarkerService.class);

    @Autowired
    public MarkerService(MarkerRepository markerRepository, UserRepository userRepository, ImageRepository imageRepository, GoogleCloudService googleCloudService) {
        this.markerRepository = markerRepository;
        this.userRepository = userRepository;
        this.imageRepository = imageRepository;
        this.googleCloudService = googleCloudService;
    }

    public List<Marker> getMarkers(String email) {
        logger.info("Fetching markers for user with email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("User not found with email: {}", email);
                    return new NoSuchElementException("User not found");
                });

        List<Marker> ownedMarkers = markerRepository.findByOwnerEmail(email);
        List<Marker> followedUsersMarkers = getFollowedUsersMarkers(user);

        Set<Marker> allMarkers = new HashSet<>(ownedMarkers);
        allMarkers.addAll(followedUsersMarkers);

        if (allMarkers.isEmpty()) {
            logger.warn("No markers found for user with email: {}", email);
            throw new NoSuchElementException("No markers for this user");
        }
        return new ArrayList<>(allMarkers);
    }

    private List<Marker> getFollowedUsersMarkers(User user) {
        List<Marker> followedUsersMarkers = new ArrayList<>();
        for (User followedUser : user.getFollowing()) {
            followedUsersMarkers.addAll(
                    markerRepository.findByOwnerEmail(followedUser.getEmail()).stream()
                            .filter(Marker::getIsPublic)
                            .toList()
            );
        }
        return followedUsersMarkers;
    }

    @Transactional
    public long addMarker(String email, Marker marker) {
        logger.info("Adding marker for user with email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("User with email {} does not exist", email);
                    return new IllegalArgumentException("User with email " + email + " does not exist");
                });
        marker.setUser(user);
        markerRepository.save(marker);
        logger.info("Marker added with ID: {}", marker.getId());
        return marker.getId();
    }

    @Transactional
    public void deleteMarker(String email, long markerId) {
        logger.info("Deleting marker with ID: {} for user with email: {}", markerId, email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("User with email {} does not exist", email);
                    return new IllegalArgumentException("User with email " + email + " does not exist");
                });

        Marker marker = markerRepository.findById(markerId)
                .orElseThrow(() -> {
                    logger.error("Marker with id {} does not exist", markerId);
                    return new IllegalArgumentException("Marker with id " + markerId + " does not exist");
                });

        if (marker.getUser().equals(user)) {
            marker.getImages().forEach(image -> deleteImage(image.getUrl()));
            markerRepository.deleteById(markerId);
            logger.info("Marker with ID: {} deleted successfully", markerId);
        } else if (marker.getViewers().removeIf(viewer -> viewer.getUser().equals(user))) {
            markerRepository.save(marker);
            logger.info("Viewer removed for marker with ID: {}", markerId);
        } else {
            logger.error("User with email {} is neither the owner nor a viewer of the marker", email);
            throw new IllegalArgumentException("User with email " + email + " is neither the owner nor a viewer of the marker");
        }
    }

    public String addImage(Long markerId, MultipartFile imageFile) throws IOException {
        logger.info("Adding image to marker with ID: {}", markerId);
        Marker marker = markerRepository.findById(markerId)
                .orElseThrow(() -> {
                    logger.error("Marker with ID {} does not exist.", markerId);
                    return new NoSuchElementException("Marker with ID " + markerId + " does not exist.");
                });

        validateImageFile(imageFile);

        if (marker.getImages().size() >= 4) {
            logger.error("Marker with ID {} already has 4 images.", markerId);
            throw new IllegalStateException("Marker already has 4 images.");
        }

        String imageUrl = storeImage(imageFile);
        Image newImage = new Image();
        newImage.setUrl(imageUrl);
        newImage.setMarker(marker);
        imageRepository.save(newImage);
        logger.info("Image added to marker with ID: {}", markerId);
        return newImage.getUrl();
    }

    private void validateImageFile(MultipartFile imageFile) {
        String contentType = imageFile.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            logger.error("Invalid file type. The file is not an image.");
            throw new IllegalArgumentException("The file is not an image.");
        }
    }

    private String storeImage(MultipartFile imageFile) {
        try {
            String imageName = UUID.randomUUID() + "-" + imageFile.getOriginalFilename(); // Ensure unique name
            byte[] bytes = imageFile.getBytes();
            logger.info("Storing image with name: {}", imageName);
            return googleCloudService.uploadImageToBucket(BUCKET_NAME, bytes, imageName);
        } catch (IOException e) {
            logger.error("Failed to store file", e);
            throw new RuntimeException("Failed to store file", e);
        }
    }

    public void updateMarkerDescription(long markerId, String description) {
        logger.info("Updating description for marker with ID: {}", markerId);
        Marker marker = getMarkerById(markerId);
        marker.setDescription(sanitizeAndCheckLength(description, 500));
        markerRepository.save(marker);
        logger.info("Description updated for marker with ID: {}", markerId);
    }

    public void updateMarkerCategory(long markerId, String category) {
        logger.info("Updating category for marker with ID: {}", markerId);
        Marker marker = getMarkerById(markerId);
        marker.setCategory(sanitizeAndCheckLength(category, 50));
        markerRepository.save(marker);
        logger.info("Category updated for marker with ID: {}", markerId);
    }

    public void updateMarkerTitle(long markerId, String title) {
        logger.info("Updating title for marker with ID: {}", markerId);
        Marker marker = getMarkerById(markerId);
        marker.setTitle(sanitizeAndCheckLength(title, 100));
        markerRepository.save(marker);
        logger.info("Title updated for marker with ID: {}", markerId);
    }

    public void updateMarkerIsPublic(long markerId, Boolean isPublic) {
        logger.info("Updating public status for marker with ID: {}", markerId);
        Marker marker = getMarkerById(markerId);
        marker.setIsPublic(isPublic);
        markerRepository.save(marker);
        logger.info("Public status updated for marker with ID: {}", markerId);
    }

    private Marker getMarkerById(long markerId) {
        return markerRepository.findById(markerId)
                .orElseThrow(() -> {
                    logger.error("Marker with id {} does not exist", markerId);
                    return new IllegalArgumentException("Marker with id " + markerId + " does not exist");
                });
    }

    public void deleteImage(String imageUrl) {
        logger.info("Deleting image with URL: {}", imageUrl);
        imageUrl = sanitizeAndCheckLength(imageUrl,1000);
        Optional<Image> image = imageRepository.findByUrl(imageUrl);
        if (image.isPresent()) {
            deleteImageFromBucket(imageUrl);
            imageRepository.delete(image.get());
            logger.info("Image with URL: {} deleted successfully", imageUrl);
        } else {
            logger.error("Image not found with URL: {}", imageUrl);
            throw new RuntimeException("Image not found with URL: " + imageUrl);
        }
    }

    private void deleteImageFromBucket(String imageUrl) {
        String imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        logger.info("Deleting image from bucket with name: {}", imageName);
        googleCloudService.deleteImageFromBucket(BUCKET_NAME, imageName);
    }
}
