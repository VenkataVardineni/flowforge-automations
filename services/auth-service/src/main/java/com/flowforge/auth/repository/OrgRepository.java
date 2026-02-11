package com.flowforge.auth.repository;

import com.flowforge.auth.model.Org;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OrgRepository extends JpaRepository<Org, UUID> {
}

