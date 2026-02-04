package com.flowforge.runner.controller;

import com.flowforge.runner.dto.CreateRunRequest;
import com.flowforge.runner.dto.RunResponse;
import com.flowforge.runner.service.RunService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/runs")
@CrossOrigin(origins = "*")
public class RunController {
    private final RunService runService;

    @Autowired
    public RunController(RunService runService) {
        this.runService = runService;
    }

    @PostMapping
    public ResponseEntity<RunResponse> createRun(@Valid @RequestBody CreateRunRequest request) {
        RunResponse response = runService.createRun(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{runId}")
    public ResponseEntity<RunResponse> getRun(@PathVariable UUID runId) {
        try {
            RunResponse response = runService.getRun(runId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

