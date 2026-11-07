
package com.example.jobTrack.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(indexes = {
        @Index(
                name = "idx_interview_job",
                columnList = "job_id"
        ),
        @Index(
                name = "idx_interview_status_date",
                columnList = "status, interview_date"
        )
})
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Interview date is required")
    private LocalDateTime interviewDate;

    @NotBlank(message = "Interview round is required")
    @Size(max = 100, message = "Interview round cannot exceed 100 characters")
    private String round;

    @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
    private String notes;

    @NotBlank(message = "Interview status is required")
    @Pattern(
            regexp = "^(Scheduled|Completed|Passed|Failed)$",
            message = "Status must be Scheduled, Completed, Passed, Failed"
    )
    private String status;

    // Reminder tracking
    private boolean oneDayReminderSent = false;

    private boolean oneHourReminderSent = false;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    public Interview() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getInterviewDate() {
        return interviewDate;
    }

    public void setInterviewDate(LocalDateTime interviewDate) {
        this.interviewDate = interviewDate;
    }

    public String getRound() {
        return round;
    }

    public void setRound(String round) {
        this.round = round;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public boolean isOneDayReminderSent() {
        return oneDayReminderSent;
    }

    public void setOneDayReminderSent(boolean oneDayReminderSent) {
        this.oneDayReminderSent = oneDayReminderSent;
    }

    public boolean isOneHourReminderSent() {
        return oneHourReminderSent;
    }

    public void setOneHourReminderSent(boolean oneHourReminderSent) {
        this.oneHourReminderSent = oneHourReminderSent;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }
}
