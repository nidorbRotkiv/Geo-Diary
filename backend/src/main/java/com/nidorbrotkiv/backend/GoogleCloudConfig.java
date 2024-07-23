package com.nidorbrotkiv.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;

@Configuration
public class GoogleCloudConfig {
    @Value("${google.cloud.project-id}")
    private String projectId;

    @Bean
    public Storage storage() {
        return StorageOptions.newBuilder()
                .setProjectId(getProjectId())
                .build()
                .getService();
    }

    private String getProjectId() {
        if (projectId == null) {
            throw new IllegalStateException("Allowed origins must be set in application.properties");
        }
        return projectId;
    }
}
