package com.flowforge.runner.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;
import java.util.UUID;

public class CreateRunRequest {
    @NotNull
    private UUID workflowId;

    private UUID triggeredBy;

    private Map<String, Object> graph;

    public UUID getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(UUID workflowId) {
        this.workflowId = workflowId;
    }

    public UUID getTriggeredBy() {
        return triggeredBy;
    }

    public void setTriggeredBy(UUID triggeredBy) {
        this.triggeredBy = triggeredBy;
    }

    public Map<String, Object> getGraph() {
        return graph;
    }

    public void setGraph(Map<String, Object> graph) {
        this.graph = graph;
    }
}


