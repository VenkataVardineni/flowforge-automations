package com.flowforge.auth.service;

import com.flowforge.auth.model.*;
import com.flowforge.auth.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrgRepository orgRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private InviteRepository inviteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Transactional
    public RegisterResponse register(String email, String password, String orgName) {
        // Check if user already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("User with email already exists");
        }

        // Create user
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user = userRepository.save(user);

        // Create org
        Org org = new Org();
        org.setName(orgName);
        org = orgRepository.save(org);

        // Create OWNER membership
        Membership membership = new Membership();
        membership.setOrgId(org.getId());
        membership.setUserId(user.getId());
        membership.setRole(Membership.Role.OWNER);
        membershipRepository.save(membership);

        // Generate JWT
        String token = jwtService.generateToken(user.getId(), org.getId(), "OWNER");

        RegisterResponse response = new RegisterResponse();
        response.setUserId(user.getId());
        response.setOrgId(org.getId());
        response.setToken(token);
        response.setRole("OWNER");
        return response;
    }

    public LoginResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Get user's primary org (first membership)
        List<Membership> memberships = membershipRepository.findByUserId(user.getId());
        if (memberships.isEmpty()) {
            throw new RuntimeException("User has no organization memberships");
        }

        Membership membership = memberships.get(0);
        String token = jwtService.generateToken(user.getId(), membership.getOrgId(), membership.getRole().name());

        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setOrgId(membership.getOrgId());
        response.setToken(token);
        response.setRole(membership.getRole().name());
        return response;
    }

    @Transactional
    public InviteResponse createInvite(UUID orgId, UUID inviterUserId, String email) {
        // Verify inviter has ADMIN or OWNER role
        Membership inviterMembership = membershipRepository.findByOrgIdAndUserId(orgId, inviterUserId)
                .orElseThrow(() -> new RuntimeException("User is not a member of this organization"));

        if (inviterMembership.getRole() != Membership.Role.ADMIN && inviterMembership.getRole() != Membership.Role.OWNER) {
            throw new RuntimeException("Only ADMIN or OWNER can invite users");
        }

        // Check if user already has membership
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            Optional<Membership> existingMembership = membershipRepository.findByOrgIdAndUserId(orgId, existingUser.get().getId());
            if (existingMembership.isPresent()) {
                throw new RuntimeException("User is already a member of this organization");
            }
        }

        // Create invite
        Invite invite = new Invite();
        invite.setOrgId(orgId);
        invite.setEmail(email);
        invite.setToken(UUID.randomUUID().toString());
        invite.setExpiresAt(LocalDateTime.now().plusDays(7)); // 7 days expiry
        invite = inviteRepository.save(invite);

        InviteResponse response = new InviteResponse();
        response.setInviteId(invite.getId());
        response.setToken(invite.getToken());
        response.setEmail(email);
        response.setExpiresAt(invite.getExpiresAt());
        return response;
    }

    @Transactional
    public AcceptInviteResponse acceptInvite(String token, String password) {
        Invite invite = inviteRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid invite token"));

        if (invite.getAcceptedAt() != null) {
            throw new RuntimeException("Invite has already been accepted");
        }

        if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invite has expired");
        }

        // Check if user exists, if not create one
        User user = userRepository.findByEmail(invite.getEmail())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(invite.getEmail());
                    newUser.setPasswordHash(passwordEncoder.encode(password));
                    return userRepository.save(newUser);
                });

        // Create MEMBER membership
        Membership membership = new Membership();
        membership.setOrgId(invite.getOrgId());
        membership.setUserId(user.getId());
        membership.setRole(Membership.Role.MEMBER);
        membershipRepository.save(membership);

        // Mark invite as accepted
        invite.setAcceptedAt(LocalDateTime.now());
        inviteRepository.save(invite);

        // Generate JWT
        String jwtToken = jwtService.generateToken(user.getId(), invite.getOrgId(), "MEMBER");

        AcceptInviteResponse response = new AcceptInviteResponse();
        response.setUserId(user.getId());
        response.setOrgId(invite.getOrgId());
        response.setToken(jwtToken);
        response.setRole("MEMBER");
        return response;
    }

    public static class RegisterResponse {
        private UUID userId;
        private UUID orgId;
        private String token;
        private String role;

        // Getters and setters
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public UUID getOrgId() { return orgId; }
        public void setOrgId(UUID orgId) { this.orgId = orgId; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class LoginResponse {
        private UUID userId;
        private UUID orgId;
        private String token;
        private String role;

        // Getters and setters
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public UUID getOrgId() { return orgId; }
        public void setOrgId(UUID orgId) { this.orgId = orgId; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class InviteResponse {
        private UUID inviteId;
        private String token;
        private String email;
        private LocalDateTime expiresAt;

        // Getters and setters
        public UUID getInviteId() { return inviteId; }
        public void setInviteId(UUID inviteId) { this.inviteId = inviteId; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public LocalDateTime getExpiresAt() { return expiresAt; }
        public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    }

    public static class AcceptInviteResponse {
        private UUID userId;
        private UUID orgId;
        private String token;
        private String role;

        // Getters and setters
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public UUID getOrgId() { return orgId; }
        public void setOrgId(UUID orgId) { this.orgId = orgId; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}

