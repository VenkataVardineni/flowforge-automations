package com.flowforge.auth.repository;

import com.flowforge.auth.model.Invite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InviteRepository extends JpaRepository<Invite, UUID> {
    Optional<Invite> findByToken(String token);
    List<Invite> findByOrgId(UUID orgId);
}

