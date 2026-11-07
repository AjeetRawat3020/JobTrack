
package com.example.jobTrack.controller;

import com.example.jobTrack.dto.DashboardResponse;
import com.example.jobTrack.dto.JobRequest;
import com.example.jobTrack.dto.JobResponse;
import com.example.jobTrack.entity.ApplicationStatus;
import com.example.jobTrack.service.JobService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@Validated
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public Page<JobResponse> getAllJobs(
            @RequestParam(defaultValue = "0")
            @Min(0) int page,

            @RequestParam(defaultValue = "10")
            @Min(1) @Max(100) int size,

            @RequestParam(required = false) List<String> sort) {

        Sort sorting = Sort.unsorted();

        if (sort != null && !sort.isEmpty()) {
            String field = sort.get(0).split(",")[0];
            sorting = Sort.by(field);
        }

        Pageable pageable = PageRequest.of(page, size, sorting);

        return jobService.getAllJobs(pageable);
    }

    @GetMapping("/search")
    public Page<JobResponse> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String jobType,

            @RequestParam(defaultValue = "0")
            @Min(0) int page,

            @RequestParam(defaultValue = "10")
            @Min(1) @Max(100) int size,

            @RequestParam(required = false) List<String> sort,
            @RequestParam(required = false) ApplicationStatus status) {

        Sort sorting = Sort.unsorted();

        if (sort != null && !sort.isEmpty()) {
            String field = sort.get(0).split(",")[0];
            sorting = Sort.by(field);
        }

        Pageable pageable = PageRequest.of(page, size, sorting);

        return jobService.searchJobs(
                keyword, company, location, jobType, status, pageable
        );
    }

    @GetMapping("/{id}")
    public JobResponse getJobById(@PathVariable Long id) {
        return jobService.getJobById(id);
    }

    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @Valid @RequestBody JobRequest jobRequest) {

        JobResponse jobResponse = jobService.createJob(jobRequest);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(jobResponse);
    }

    @PutMapping("/{id}")
    public JobResponse updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobRequest jobRequest) {

        return jobService.updateJob(id, jobRequest);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteJob(
            @PathVariable Long id) {

        jobService.deleteJob(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Job deleted successfully");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    public DashboardResponse getDashboardStats() {
        return jobService.getDashboardStats();
    }
}
