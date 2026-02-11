package com.flowforge.workflow.service;

import com.flowforge.workflow.model.AuditLog;
import com.flowforge.workflow.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public void logAction(
            UUID orgId,
            UUID userId,
            String action,
            String resourceType,
            UUID resourceId,
            Map<String, Object> details,
            HttpServletRequest request) {
        try {
            AuditLog log = new AuditLog();
            log.setOrgId(orgId);
            log.setUserId(userId);
            log.setAction(action);
            log.setResourceType(resourceType);
            log.setResourceId(resourceId);

            if (details != null) {
                log.setDetails(objectMapper.writeValueAsString(details));
            }

            if (request != null) {
                log.setIpAddress(getClientIpAddress(request));
                log.setUserAgent(request.getHeader("User-Agent"));
            }

            auditLogRepository.save(log);
        } catch (Exception e) {
            // Don't fail the request if audit logging fails
            System.err.println("Failed to write audit log: " + e.getMessage());
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}

