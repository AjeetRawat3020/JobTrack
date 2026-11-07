package com.example.jobTrack.dto;

public class DashboardResponse {
    private long totalApplications;
    private long saved;
    private long applied;
    private long interview;
    private long offer;
    private long rejected;

    public DashboardResponse(
            long totalApplications,
            long saved,
            long applied,
            long interview,
            long offer,
            long rejected) {
        this.totalApplications = totalApplications;
        this.saved = saved;
        this.applied = applied;
        this.interview = interview;
        this.offer = offer;
        this.rejected = rejected;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public long getSaved() {
        return saved;
    }

    public long getInterview() {
        return interview;
    }

    public long getApplied() {
        return applied;
    }

    public long getOffer() {
        return offer;
    }

    public long getRejected() {
        return rejected;
    }
}
