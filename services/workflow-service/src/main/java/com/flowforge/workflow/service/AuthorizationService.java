package com.flowforge.workflow.service;

import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthorizationService {

    public enum Role {
        OWNER, ADMIN, MEMBER
    }

    public boolean canCreateWorkflow(UUID orgId, String role) {
        // All roles can create workflows in their org
        return role != null && (role.equals("OWNER") || role.equals("ADMIN") || role.equals("MEMBER"));
    }

    public boolean canUpdateWorkflow(UUID orgId, String role) {
        // All roles can update workflows in their org
        return role != null && (role.equals("OWNER") || role.equals("ADMIN") || role.equals("MEMBER"));
    }

    public boolean canDeleteWorkflow(UUID orgId, String role) {
        // Only OWNER can delete workflows
        return role != null && role.equals("OWNER");
    }

    public boolean canRunWorkflow(UUID orgId, String role) {
        // All roles can run workflows
        return role != null && (role.equals("OWNER") || role.equals("ADMIN") || role.equals("MEMBER"));
    }

    public boolean canInviteUsers(UUID orgId, String role) {
        // ADMIN and OWNER can invite users
        return role != null && (role.equals("OWNER") || role.equals("ADMIN"));
    }

    public boolean canManageOrgSettings(UUID orgId, String role) {
        // Only OWNER can manage org settings
        return role != null && role.equals("OWNER");
    }
}

