package com.nidorbrotkiv.backend.bucket;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class GoogleCloudService {

    private final Storage storage;
    private static final Logger logger = LoggerFactory.getLogger(GoogleCloudService.class);

    @Autowired
    public GoogleCloudService(Storage storage) {
        this.storage = storage;
    }

    public String uploadImageToBucket(String bucketName, byte[] content, String imageName) {
        try {
            BlobId blobId = BlobId.of(bucketName, imageName);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId).build();
            storage.create(blobInfo, content);
            String url = String.format("https://storage.googleapis.com/%s/%s", bucketName, imageName);
            logger.info("Image uploaded successfully to bucket: {}, image: {}", bucketName, imageName);
            return url;
        } catch (Exception e) {
            logger.error("Error uploading image to bucket: {}, image: {}", bucketName, imageName, e);
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    public void deleteImageFromBucket(String bucketName, String imageName) {
        try {
            boolean deleted = storage.delete(BlobId.of(bucketName, imageName));
            if (deleted) {
                logger.info("Image deleted successfully from bucket: {}, image: {}", bucketName, imageName);
            } else {
                logger.warn("Image not found in bucket: {}, image: {}", bucketName, imageName);
            }
        } catch (Exception e) {
            logger.error("Error deleting image from bucket: {}, image: {}", bucketName, imageName, e);
            throw new RuntimeException("Failed to delete image", e);
        }
    }
}
