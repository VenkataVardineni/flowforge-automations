package com.flowforge.workflow.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;
import java.util.UUID;

public class SaveVersionRequest {
    @NotNull
    private UUID workflowId;

    @NotNull
    private Map<String, Object> graph;

    public UUID getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(UUID workflowId) {
        this.workflowId = workflowId;
    }

    public Map<String, Object> getGraph() {
        return graph;
    }

    public void setGraph(Map<String, Object> graph) {
        this.graph = graph;
    }
}



