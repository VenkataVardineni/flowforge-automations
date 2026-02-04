package com.flowforge.workflow.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowforge.workflow.dto.CreateWorkflowRequest;
import com.flowforge.workflow.dto.SaveVersionRequest;
import com.flowforge.workflow.dto.WorkflowResponse;
import com.flowforge.workflow.model.Workflow;
import com.flowforge.workflow.model.WorkflowVersion;
import com.flowforge.workflow.repository.WorkflowRepository;
import com.flowforge.workflow.repository.WorkflowVersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkflowService {
    private final WorkflowRepository workflowRepository;
    private final WorkflowVersionRepository workflowVersionRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public WorkflowService(
            WorkflowRepository workflowRepository,
            WorkflowVersionRepository workflowVersionRepository,
            ObjectMapper objectMapper) {
        this.workflowRepository = workflowRepository;
        this.workflowVersionRepository = workflowVersionRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public WorkflowResponse createWorkflow(CreateWorkflowRequest request) {
        Workflow workflow = new Workflow();
        workflow.setWorkspaceId(request.getWorkspaceId());
        workflow.setName(request.getName());
        workflow.setStatus(Workflow.WorkflowStatus.DRAFT);
        workflow.setVersion(1);
        workflow = workflowRepository.save(workflow);

        if (request.getGraph() != null) {
            saveWorkflowVersion(workflow.getId(), 1, request.getGraph());
        }

        return getWorkflowResponse(workflow);
    }

    public Optional<WorkflowResponse> getWorkflow(UUID id) {
        return workflowRepository.findById(id)
                .map(this::getWorkflowResponse);
    }

    @Transactional
    public WorkflowResponse saveVersion(SaveVersionRequest request) {
        Workflow workflow = workflowRepository.findById(request.getWorkflowId())
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        Integer newVersion = workflow.getVersion() + 1;
        workflow.setVersion(newVersion);
        workflow = workflowRepository.save(workflow);

        saveWorkflowVersion(workflow.getId(), newVersion, request.getGraph());

        return getWorkflowResponse(workflow);
    }

    public List<WorkflowVersion> getVersions(UUID workflowId) {
        return workflowVersionRepository.findByWorkflowIdOrderByVersionDesc(workflowId);
    }

    private void saveWorkflowVersion(UUID workflowId, Integer version, Map<String, Object> graph) {
        try {
            String graphJson = objectMapper.writeValueAsString(graph);
            WorkflowVersion workflowVersion = new WorkflowVersion();
            workflowVersion.setWorkflowId(workflowId);
            workflowVersion.setVersion(version);
            workflowVersion.setGraphJson(graphJson);
            workflowVersionRepository.save(workflowVersion);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize graph JSON", e);
        }
    }

    private WorkflowResponse getWorkflowResponse(Workflow workflow) {
        Map<String, Object> graph = null;
        Optional<WorkflowVersion> latestVersion = workflowVersionRepository
                .findByWorkflowIdAndVersion(workflow.getId(), workflow.getVersion());

        if (latestVersion.isPresent()) {
            try {
                graph = objectMapper.readValue(
                        latestVersion.get().getGraphJson(),
                        Map.class
                );
            } catch (JsonProcessingException e) {
                // Log error but don't fail
            }
        }

        return new WorkflowResponse(workflow, graph);
    }
}

