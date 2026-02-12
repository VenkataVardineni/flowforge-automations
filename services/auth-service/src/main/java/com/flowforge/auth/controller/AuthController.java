package com.flowforge.auth.controller;

import com.flowforge.auth.dto.*;
import com.flowforge.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        AuthService.RegisterResponse response = authService.register(
                request.getEmail(),
                request.getPassword(),
                request.getOrgName()
        );
        RegisterResponse dto = new RegisterResponse();
        dto.setUserId(response.getUserId());
        dto.setOrgId(response.getOrgId());
        dto.setToken(response.getToken());
        dto.setRole(response.getRole());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthService.LoginResponse response = authService.login(
                    request.getEmail(),
                    request.getPassword()
            );
            LoginResponse dto = new LoginResponse();
            dto.setUserId(response.getUserId());
            dto.setOrgId(response.getOrgId());
            dto.setToken(response.getToken());
            dto.setRole(response.getRole());
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            // Return 401 for invalid credentials
            return ResponseEntity.status(401).body(
                    java.util.Map.of("error", e.getMessage() != null ? e.getMessage() : "Invalid credentials")
            );
        }
    }

    @PostMapping("/orgs/{orgId}/invites")
    public ResponseEntity<InviteResponse> createInvite(
            @PathVariable UUID orgId,
            @RequestBody CreateInviteRequest request,
            @RequestHeader("X-User-Id") UUID userId
    ) {
        AuthService.InviteResponse response = authService.createInvite(
                orgId,
                userId,
                request.getEmail()
        );
        InviteResponse dto = new InviteResponse();
        dto.setInviteId(response.getInviteId());
        dto.setToken(response.getToken());
        dto.setEmail(response.getEmail());
        dto.setExpiresAt(response.getExpiresAt());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/invites/accept")
    public ResponseEntity<AcceptInviteResponse> acceptInvite(@RequestBody AcceptInviteRequest request) {
        AuthService.AcceptInviteResponse response = authService.acceptInvite(
                request.getToken(),
                request.getPassword()
        );
        AcceptInviteResponse dto = new AcceptInviteResponse();
        dto.setUserId(response.getUserId());
        dto.setOrgId(response.getOrgId());
        dto.setToken(response.getToken());
        dto.setRole(response.getRole());
        return ResponseEntity.ok(dto);
    }
}

