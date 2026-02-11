package com.flowforge.workflow.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.UUID;

@Component
public class OrgContextInterceptor implements HandlerInterceptor {

    private final DataSource dataSource;

    public OrgContextInterceptor(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String orgIdHeader = request.getHeader("X-Org-Id");
        if (orgIdHeader != null && !orgIdHeader.isEmpty()) {
            try {
                UUID orgId = UUID.fromString(orgIdHeader);
                setOrgContext(orgId);
            } catch (IllegalArgumentException e) {
                // Invalid UUID, ignore
            }
        }
        return true;
    }

    private void setOrgContext(UUID orgId) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SET LOCAL app.org_id = ?")) {
            stmt.setString(1, orgId.toString());
            stmt.execute();
        } catch (Exception e) {
            // Log error but don't fail request
            System.err.println("Failed to set org context: " + e.getMessage());
        }
    }
}

