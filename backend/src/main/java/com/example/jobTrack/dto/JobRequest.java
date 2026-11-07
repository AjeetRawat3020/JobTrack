
package com.example.jobTrack.dto;

import com.example.jobTrack.entity.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class JobRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String title;

    @NotBlank(message = "Company is required")
    @Size(max = 150, message = "Company cannot exceed 150 characters")
    private String company;

    @NotBlank(message = "Location is required")
    @Size(max = 150, message = "Location cannot exceed 150 characters")
    private String location;

    @NotBlank(message = "JobType is required")
    @Size(max = 100, message = "JobType cannot exceed 100 characters")
    private String jobType;

    @NotBlank(message = "Description is required")
    @Size(max = 5000, message = "Description cannot exceed 5000 characters")
    private String description;

    private ApplicationStatus status;

    @PastOrPresent(message = "Applied date cannot be in the future")
    private LocalDate appliedDate;

    @Pattern(
            regexp = "^(https?://.+)?$",
            message = "Job URL must start with http:// or https://"
    )
    @Size(max = 2048, message = "Job URL cannot exceed 2048 characters")
    private String jobUrl;

    @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
    private String notes;

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public LocalDate getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(LocalDate appliedDate) {
        this.appliedDate = appliedDate;
    }

    public String getJobUrl() {
        return jobUrl;
    }

    public void setJobUrl(String jobUrl) {
        this.jobUrl = jobUrl;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getJobType() {
        return jobType;
    }

    public void setJobType(String jobType) {
        this.jobType = jobType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
