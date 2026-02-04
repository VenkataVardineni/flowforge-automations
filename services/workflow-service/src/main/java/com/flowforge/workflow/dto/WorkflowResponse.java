package com.flowforge.workflow.dto;

import com.flowforge.workflow.model.Workflow;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public class WorkflowResponse {
    private UUID id;
    private UUID workspaceId;
    private String name;
    private Workflow.WorkflowStatus status;
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Map<String, Object> graph;

    public WorkflowResponse() {}

    public WorkflowResponse(Workflow workflow, Map<String, Object> graph) {
        this.id = workflow.getId();
        this.workspaceId = workflow.getWorkspaceId();
        this.name = workflow.getName();
        this.status = workflow.getStatus();
        this.version = workflow.getVersion();
        this.createdAt = workflow.getCreatedAt();
        this.updatedAt = workflow.getUpdatedAt();
        this.graph = graph;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

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

    public Workflow.WorkflowStatus getStatus() {
        return status;
    }

    public void setStatus(Workflow.WorkflowStatus status) {
        this.status = status;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Map<String, Object> getGraph() {
        return graph;
    }

    public void setGraph(Map<String, Object> graph) {
        this.graph = graph;
    }
}

