package com.nidorbrotkiv.backend.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.DelegatingFilterProxy;

@Configuration
public class RateLimitFilterConfig {
    private static final String BEAN_NAME = "rateLimitingFilter";

    @Bean
    public FilterRegistrationBean<DelegatingFilterProxy> rateLimitingFilterBean() {
        FilterRegistrationBean<DelegatingFilterProxy> registrationBean = new FilterRegistrationBean<>();
        DelegatingFilterProxy proxy = new DelegatingFilterProxy(BEAN_NAME);

        registrationBean.setFilter(proxy);
        registrationBean.addUrlPatterns("/api/*");
        return registrationBean;
    }
}
