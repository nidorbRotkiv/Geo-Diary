package com.nidorbrotkiv.backend.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class BucketConfig {

    @Value("${bucket.capacity:1000}")
    private int capacity;

    @Value("${bucket.refill.duration:1}")
    private int refillDuration;

    private static final Logger logger = LoggerFactory.getLogger(BucketConfig.class);

    @Bean
    public Bucket bucket() {
        Refill refill = Refill.greedy(capacity, Duration.ofMinutes(refillDuration));
        Bandwidth limit = Bandwidth.classic(capacity, refill);
        Bucket bucket = Bucket.builder().addLimit(limit).build();
        logger.info("Bucket created with capacity: {} and refill duration: {} minute(s)", capacity, refillDuration);
        return bucket;
    }
}