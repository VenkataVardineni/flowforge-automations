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
    private final AuthorizationService authorizationService;

    @Autowired
    public WorkflowController(WorkflowService workflowService, AuthorizationService authorizationService) {
        this.workflowService = workflowService;
        this.authorizationService = authorizationService;
    }

    @PostMapping
    public ResponseEntity<WorkflowResponse> createWorkflow(
            @Valid @RequestBody CreateWorkflowRequest request,
            @RequestHeader(value = "X-Org-Id", required = false) String orgIdHeader,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            HttpServletRequest httpRequest) {
        UUID orgId = orgIdHeader != null ? UUID.fromString(orgIdHeader) : null;
        
        // Authorization check
        if (!authorizationService.canCreateWorkflow(orgId, role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        WorkflowResponse response = workflowService.createWorkflow(request, orgId);
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
            @Valid @RequestBody SaveVersionRequest request,
            @RequestHeader(value = "X-Org-Id", required = false) String orgIdHeader,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        UUID orgId = orgIdHeader != null ? UUID.fromString(orgIdHeader) : null;
        
        // Authorization check
        if (!authorizationService.canUpdateWorkflow(orgId, role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
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

