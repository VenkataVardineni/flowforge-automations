package com.flowforge.runner.dto;

import com.flowforge.runner.model.StepRun;
import java.time.LocalDateTime;
import java.util.UUID;

public class StepUpdate {
    private UUID runId;
    private UUID stepId;
    private String nodeId;
    private StepRun.StepStatus status;
    private String inputJson;
    private String outputJson;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private String error;
    private Integer retryCount;

    public StepUpdate() {}

    public StepUpdate(StepRun stepRun) {
        this.runId = stepRun.getRunId();
        this.stepId = stepRun.getId();
        this.nodeId = stepRun.getNodeId();
        this.status = stepRun.getStatus();
        this.inputJson = stepRun.getInputJson();
        this.outputJson = stepRun.getOutputJson();
        this.startedAt = stepRun.getStartedAt();
        this.finishedAt = stepRun.getFinishedAt();
        this.error = stepRun.getError();
        this.retryCount = stepRun.getRetryCount();
    }

    public UUID getRunId() {
        return runId;
    }

    public void setRunId(UUID runId) {
        this.runId = runId;
    }

    public UUID getStepId() {
        return stepId;
    }

    public void setStepId(UUID stepId) {
        this.stepId = stepId;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public StepRun.StepStatus getStatus() {
        return status;
    }

    public void setStatus(StepRun.StepStatus status) {
        this.status = status;
    }

    public String getInputJson() {
        return inputJson;
    }

    public void setInputJson(String inputJson) {
        this.inputJson = inputJson;
    }

    public String getOutputJson() {
        return outputJson;
    }

    public void setOutputJson(String outputJson) {
        this.outputJson = outputJson;
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

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }
}



