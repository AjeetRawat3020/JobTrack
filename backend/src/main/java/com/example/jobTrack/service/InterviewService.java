package com.example.jobTrack.service;

import com.example.jobTrack.dto.InterviewResponse;
import com.example.jobTrack.entity.Interview;
import com.example.jobTrack.entity.Job;
import com.example.jobTrack.exception.JobNotFoundException;
import com.example.jobTrack.repository.InterviewRepository;
import com.example.jobTrack.repository.JobRepository;
import com.example.jobTrack.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public InterviewService(
            InterviewRepository interviewRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.interviewRepository = interviewRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private String getCurrentUsername() {
        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }

    private Job getOwnedJob(Long jobId) {

        String username = getCurrentUsername();

        return jobRepository.findById(jobId)
                .filter(job -> job.getUser() != null
                        && job.getUser().getUsername().equals(username))
                .orElseThrow(() ->
                        new JobNotFoundException("Job not found with id: " + jobId));
    }

    private Interview getOwnedInterview(Long interviewId) {

        String username = getCurrentUsername();

        return interviewRepository.findById(interviewId)
                .filter(interview -> interview.getJob() != null
                        && interview.getJob().getUser() != null
                        && interview.getJob().getUser().getUsername().equals(username))
                .orElseThrow(() ->
                        new RuntimeException("Interview not found"));
    }

    // Get interviews of a job
    public List<InterviewResponse> getInterviewsByJob(Long jobId) {

        getOwnedJob(jobId);

        return interviewRepository.findByJobId(jobId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Create interview
    @Transactional
    public InterviewResponse createInterview(Long jobId, Interview interview) {

        Job job = getOwnedJob(jobId);

        interview.setId(null);
        interview.setJob(job);

        Interview savedInterview = interviewRepository.save(interview);

        // Create notification when interview is added
        notificationService.createNotification(
                "New Interview Scheduled",
                "A new interview has been scheduled for your job application (Job ID: "
                        + job.getId() + ").",
                "INTERVIEW_ADDED",
                job.getUser()
        );

        return mapToResponse(savedInterview);
    }

    // Update interview
    @Transactional
    public InterviewResponse updateInterview(
            Long interviewId,
            Interview updatedInterview) {

        Interview interview = getOwnedInterview(interviewId);

        String previousStatus = interview.getStatus();

        java.time.LocalDateTime previousInterviewDate =
                interview.getInterviewDate();

        boolean dateChanged = !Objects.equals(
                previousInterviewDate,
                updatedInterview.getInterviewDate()
        );

        boolean becomingScheduled =
                !"Scheduled".equalsIgnoreCase(previousStatus)
                        && "Scheduled".equalsIgnoreCase(updatedInterview.getStatus());

        interview.setInterviewDate(updatedInterview.getInterviewDate());
        interview.setRound(updatedInterview.getRound());
        interview.setNotes(updatedInterview.getNotes());
        interview.setStatus(updatedInterview.getStatus());

        if (dateChanged || becomingScheduled) {
            interview.setOneDayReminderSent(false);
            interview.setOneHourReminderSent(false);
        }

        Interview savedInterview = interviewRepository.save(interview);

        if (!"Completed".equalsIgnoreCase(previousStatus)
                && "Completed".equalsIgnoreCase(savedInterview.getStatus())) {

            notificationService.createNotification(
                    "Interview Completed",
                    "Your interview (ID: " + savedInterview.getId()
                            + ") has been marked as completed.",
                    "INTERVIEW_COMPLETED",
                    interview.getJob().getUser()
            );
        }

        return mapToResponse(savedInterview);
    }

    // Delete interview
    @Transactional
    public void deleteInterview(Long interviewId) {

        Interview interview = getOwnedInterview(interviewId);

        interviewRepository.delete(interview);
    }

    // Convert entity to DTO
    private InterviewResponse mapToResponse(Interview interview) {

        InterviewResponse response = new InterviewResponse();

        response.setId(interview.getId());
        response.setInterviewDate(interview.getInterviewDate());
        response.setRound(interview.getRound());
        response.setNotes(interview.getNotes());
        response.setStatus(interview.getStatus());
        response.setJobId(interview.getJob().getId());

        return response;
    }
}
