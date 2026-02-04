package com.flowforge.runner.repository;

import com.flowforge.runner.model.StepRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface StepRunRepository extends JpaRepository<StepRun, UUID> {
    List<StepRun> findByRunIdOrderByStartedAtAsc(UUID runId);
}

