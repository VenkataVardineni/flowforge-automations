package com.flowforge.workflow.repository;

import com.flowforge.workflow.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByOrgIdOrderByCreatedAtDesc(UUID orgId);
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<AuditLog> findByActionOrderByCreatedAtDesc(String action);
}

