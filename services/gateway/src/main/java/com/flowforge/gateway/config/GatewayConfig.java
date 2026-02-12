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
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtFilter.apply(new JwtAuthenticationGatewayFilterFactory.Config())))
                        .uri("http://localhost:8082"))
                .route("runner-service", r -> r
                        .path("/api/runs/**", "/api/run/**", "/api/events/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtFilter.apply(new JwtAuthenticationGatewayFilterFactory.Config())))
                        .uri("http://localhost:8081"))
                .route("auth-service", r -> r
                        .path("/auth/**", "/api/auth/**")
                        // No JWT filter for auth endpoints - they're public
                        .uri("http://localhost:8090"))
                .build();
    }
}

