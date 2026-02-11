package com.flowforge.gateway.config;

import com.flowforge.gateway.filter.JwtAuthenticationGatewayFilterFactory;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder, JwtAuthenticationGatewayFilterFactory jwtFilter) {
        return builder.routes()
                .route("workflow-service", r -> r
                        .path("/api/workflows/**", "/api/workflow/**", "/api/audit/**")
                        .filters(f -> f.filter(jwtFilter.apply(new JwtAuthenticationGatewayFilterFactory.Config())))
                        .uri("http://workflow-service:8080"))
                .route("runner-service", r -> r
                        .path("/api/runs/**", "/api/run/**", "/api/events/**")
                        .filters(f -> f.filter(jwtFilter.apply(new JwtAuthenticationGatewayFilterFactory.Config())))
                        .uri("http://runner-api:8081"))
                .route("auth-service", r -> r
                        .path("/auth/**", "/api/auth/**")
                        .uri("http://auth-service:8090"))
                .build();
    }
}

