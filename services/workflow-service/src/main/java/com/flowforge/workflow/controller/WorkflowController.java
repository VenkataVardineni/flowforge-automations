package com.flowforge.workflow.controller;

import com.flowforge.workflow.dto.CreateWorkflowRequest;
import com.flowforge.workflow.dto.SaveVersionRequest;
import com.flowforge.workflow.dto.WorkflowResponse;
import com.flowforge.workflow.model.WorkflowVersion;
import com.flowforge.workflow.service.WorkflowService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workflows")
@CrossOrigin(origins = "*")
public class WorkflowController {
    private final WorkflowService workflowService;

    @Autowired
    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @PostMapping
    public ResponseEntity<WorkflowResponse> createWorkflow(@Valid @RequestBody CreateWorkflowRequest request) {
        WorkflowResponse response = workflowService.createWorkflow(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkflowResponse> getWorkflow(@PathVariable UUID id) {
        return workflowService.getWorkflow(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/versions")
    public ResponseEntity<WorkflowResponse> saveVersion(
            @PathVariable UUID id,
            @Valid @RequestBody SaveVersionRequest request) {
        request.setWorkflowId(id);
        WorkflowResponse response = workflowService.saveVersion(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<WorkflowVersion>> getVersions(@PathVariable UUID id) {
        List<WorkflowVersion> versions = workflowService.getVersions(id);
        return ResponseEntity.ok(versions);
    }

    @GetMapping
    public ResponseEntity<List<WorkflowResponse>> getAllWorkflows(
            @RequestParam(required = false, defaultValue = "00000000-0000-0000-0000-000000000000") UUID workspaceId) {
        List<WorkflowResponse> workflows = workflowService.getAllWorkflows(workspaceId);
        return ResponseEntity.ok(workflows);
    }
}

