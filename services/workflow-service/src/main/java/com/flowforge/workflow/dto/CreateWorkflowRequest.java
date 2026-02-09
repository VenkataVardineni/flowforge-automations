package com.flowforge.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import java.util.UUID;

public class CreateWorkflowRequest {
    @NotNull
    private UUID workspaceId;

    @NotBlank
    private String name;

    private Map<String, Object> graph;

    public UUID getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(UUID workspaceId) {
        this.workspaceId = workspaceId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Map<String, Object> getGraph() {
        return graph;
    }

    public void setGraph(Map<String, Object> graph) {
        this.graph = graph;
    }
}


