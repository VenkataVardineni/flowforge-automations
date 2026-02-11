package com.flowforge.auth.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class InviteResponse {
    private UUID inviteId;
    private String token;
    private String email;
    private LocalDateTime expiresAt;

    public UUID getInviteId() {
        return inviteId;
    }

    public void setInviteId(UUID inviteId) {
        this.inviteId = inviteId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}

