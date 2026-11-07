package com.example.jobTrack.dto;

import com.example.jobTrack.entity.ApplicationStatus;
import java.time.LocalDateTime;

public class ApplicationStatusHistoryResponse {

    private Long id;
    private ApplicationStatus previousStatus;
    private ApplicationStatus newStatus;
    private LocalDateTime changedAt;
    private Long jobId;

    public ApplicationStatusHistoryResponse(
            Long id,
            ApplicationStatus previousStatus,
            ApplicationStatus newStatus,
            LocalDateTime changedAt,
            Long jobId) {
        this.id = id;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedAt = changedAt;
        this.jobId = jobId;
    }

    public Long getId() {
        return id;
    }

    public ApplicationStatus getPreviousStatus() {
        return previousStatus;
    }

    public ApplicationStatus getNewStatus() {
        return newStatus;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public Long getJobId() {
        return jobId;
    }
}
