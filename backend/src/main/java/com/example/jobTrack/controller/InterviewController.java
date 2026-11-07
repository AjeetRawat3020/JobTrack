
package com.example.jobTrack.controller;

import com.example.jobTrack.dto.InterviewResponse;
import com.example.jobTrack.entity.Interview;
import com.example.jobTrack.service.InterviewService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    // Get all interviews for a job
    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<InterviewResponse>> getInterviewsByJob(
            @PathVariable Long jobId) {

        return ResponseEntity.ok(
                interviewService.getInterviewsByJob(jobId)
        );
    }

    // Create interview
    @PostMapping("/job/{jobId}")
    public ResponseEntity<InterviewResponse> createInterview(
            @PathVariable Long jobId,
            @Valid @RequestBody Interview interview) {

        InterviewResponse response =
                interviewService.createInterview(jobId, interview);

        return ResponseEntity.status(201).body(response);
    }

    // Update interview
    @PutMapping("/{interviewId}")
    public ResponseEntity<InterviewResponse> updateInterview(
            @PathVariable Long interviewId,
            @Valid @RequestBody Interview interview) {

        return ResponseEntity.ok(
                interviewService.updateInterview(interviewId, interview)
        );
    }

    // Delete interview
    @DeleteMapping("/{interviewId}")
    public ResponseEntity<Void> deleteInterview(
            @PathVariable Long interviewId) {

        interviewService.deleteInterview(interviewId);

        return ResponseEntity.noContent().build();
    }
}
