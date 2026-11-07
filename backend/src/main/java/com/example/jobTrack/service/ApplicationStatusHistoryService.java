package com.example.jobTrack.service;

import com.example.jobTrack.dto.ApplicationStatusHistoryResponse;
import com.example.jobTrack.entity.ApplicationStatus;
import com.example.jobTrack.entity.ApplicationStatusHistory;
import com.example.jobTrack.entity.Job;
import com.example.jobTrack.exception.JobNotFoundException;
import com.example.jobTrack.repository.ApplicationStatusHistoryRepository;
import com.example.jobTrack.repository.JobRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationStatusHistoryService {

    private final ApplicationStatusHistoryRepository historyRepository;
    private final JobRepository jobRepository;

    public ApplicationStatusHistoryService(ApplicationStatusHistoryRepository historyRepository,
                                           JobRepository jobRepository){
        this.historyRepository = historyRepository;
        this.jobRepository = jobRepository;
    }

    public void recordStatusChange(
            Job job,
            ApplicationStatus previousStatus,
            ApplicationStatus newStatus){

        ApplicationStatusHistory history = new ApplicationStatusHistory();

        history.setJob(job);
        history.setPreviousStatus(previousStatus);
        history.setNewStatus(newStatus);

        historyRepository.save(history);
    }

    public List<ApplicationStatusHistoryResponse> getJobStatusHistory(Long jobId){

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        Job job = jobRepository.findById(jobId)
                .filter(foundJob ->
                        foundJob.getUser() != null &&
                                foundJob.getUser().getUsername().equals(username))
                .orElseThrow(()->
                        new JobNotFoundException("Job not found with id: "+jobId));

        return historyRepository
                .findByJobIdOrderByChangedAtDesc(job.getId())
                .stream()
                .map(history -> new ApplicationStatusHistoryResponse(
                        history.getId(),
                        history.getPreviousStatus(),
                        history.getNewStatus(),
                        history.getChangedAt(),
                        job.getId()
                ))
                .toList();
    }
}
