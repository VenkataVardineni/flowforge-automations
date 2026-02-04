package com.flowforge.runner.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowforge.runner.dto.CreateRunRequest;
import com.flowforge.runner.dto.RunResponse;
import com.flowforge.runner.dto.StepUpdate;
import com.flowforge.runner.model.Run;
import com.flowforge.runner.model.StepRun;
import com.flowforge.runner.repository.RunRepository;
import com.flowforge.runner.repository.StepRunRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class RunService {
    private final RunRepository runRepository;
    private final StepRunRepository stepRunRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public RunService(
            RunRepository runRepository,
            StepRunRepository stepRunRepository,
            SimpMessagingTemplate messagingTemplate,
            ObjectMapper objectMapper) {
        this.runRepository = runRepository;
        this.stepRunRepository = stepRunRepository;
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public RunResponse createRun(CreateRunRequest request) {
        Run run = new Run();
        run.setWorkflowId(request.getWorkflowId());
        run.setStatus(Run.RunStatus.PENDING);
        run.setTriggeredBy(request.getTriggeredBy());
        run = runRepository.save(run);

        // Stub execution - in real implementation, this would execute the workflow graph
        CompletableFuture.runAsync(() -> executeWorkflow(run, request.getGraph()));

        List<StepRun> steps = stepRunRepository.findByRunIdOrderByStartedAtAsc(run.getId());
        return new RunResponse(run, steps);
    }

    public RunResponse getRun(UUID runId) {
        Run run = runRepository.findById(runId)
                .orElseThrow(() -> new RuntimeException("Run not found"));
        List<StepRun> steps = stepRunRepository.findByRunIdOrderByStartedAtAsc(runId);
        return new RunResponse(run, steps);
    }

    private void executeWorkflow(Run run, Map<String, Object> graph) {
        try {
            run.setStatus(Run.RunStatus.RUNNING);
            runRepository.save(run);

            // Stub: Create a sample step run
            StepRun stepRun = new StepRun();
            stepRun.setRunId(run.getId());
            stepRun.setNodeId("stub-node-1");
            stepRun.setStatus(StepRun.StepStatus.RUNNING);
            stepRun.setStartedAt(LocalDateTime.now());
            stepRun = stepRunRepository.save(stepRun);

            // Send update via WebSocket
            sendStepUpdate(run.getId(), stepRun);

            // Simulate execution delay
            Thread.sleep(1000);

            stepRun.setStatus(StepRun.StepStatus.COMPLETED);
            stepRun.setFinishedAt(LocalDateTime.now());
            try {
                stepRun.setOutputJson(objectMapper.writeValueAsString(Map.of("result", "success")));
            } catch (JsonProcessingException e) {
                // Ignore
            }
            stepRunRepository.save(stepRun);
            sendStepUpdate(run.getId(), stepRun);

            run.setStatus(Run.RunStatus.COMPLETED);
            run.setFinishedAt(LocalDateTime.now());
            runRepository.save(run);

        } catch (Exception e) {
            run.setStatus(Run.RunStatus.FAILED);
            run.setErrorMessage(e.getMessage());
            run.setFinishedAt(LocalDateTime.now());
            runRepository.save(run);
        }
    }

    private void sendStepUpdate(UUID runId, StepRun stepRun) {
        StepUpdate update = new StepUpdate(stepRun);
        messagingTemplate.convertAndSend("/topic/runs/" + runId + "/stream", update);
    }
}

