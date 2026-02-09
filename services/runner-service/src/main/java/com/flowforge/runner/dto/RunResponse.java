package com.flowforge.runner.dto;

import com.flowforge.runner.model.Run;
import com.flowforge.runner.model.StepRun;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class RunResponse {
    private UUID id;
    private UUID workflowId;
    private Run.RunStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private UUID triggeredBy;
    private String errorMessage;
    private List<StepRun> steps;

    public RunResponse() {}

    public RunResponse(Run run, List<StepRun> steps) {
        this.id = run.getId();
        this.workflowId = run.getWorkflowId();
        this.status = run.getStatus();
        this.startedAt = run.getStartedAt();
        this.finishedAt = run.getFinishedAt();
        this.triggeredBy = run.getTriggeredBy();
        this.errorMessage = run.getErrorMessage();
        this.steps = steps;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(UUID workflowId) {
        this.workflowId = workflowId;
    }

    public Run.RunStatus getStatus() {
        return status;
    }

    public void setStatus(Run.RunStatus status) {
        this.status = status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
    }

    public UUID getTriggeredBy() {
        return triggeredBy;
    }

    public void setTriggeredBy(UUID triggeredBy) {
        this.triggeredBy = triggeredBy;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public List<StepRun> getSteps() {
        return steps;
    }

    public void setSteps(List<StepRun> steps) {
        this.steps = steps;
    }
}


