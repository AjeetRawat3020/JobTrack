package com.example.jobTrack.service;

import com.example.jobTrack.dto.DashboardResponse;
import com.example.jobTrack.dto.JobRequest;
import com.example.jobTrack.dto.JobResponse;
import com.example.jobTrack.entity.ApplicationStatus;
import com.example.jobTrack.entity.Job;
import com.example.jobTrack.entity.User;
import com.example.jobTrack.exception.JobNotFoundException;
import com.example.jobTrack.repository.JobRepository;
import com.example.jobTrack.repository.UserRepository;
import com.example.jobTrack.specification.JobSpecification;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ApplicationStatusHistoryService historyService;

    public JobService(JobRepository jobRepository,
                      UserRepository userRepository,
                      ApplicationStatusHistoryService historyService){
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.historyService = historyService;
    }


    @Transactional
    public JobResponse createJob(JobRequest jobRequest){

        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(()->
                        new org.springframework.security.core.userdetails.UsernameNotFoundException(
                                "User not found: " + username
                        ));

        Job job = new Job();

        job.setTitle(jobRequest.getTitle());
        job.setCompany(jobRequest.getCompany());
        job.setLocation(jobRequest.getLocation());
        job.setJobType(jobRequest.getJobType());
        job.setDescription(jobRequest.getDescription());
        job.setStatus(
                jobRequest.getStatus() == null
                        ? ApplicationStatus.APPLIED
                        : jobRequest.getStatus()
        );
        if (jobRequest.getStatus() == ApplicationStatus.SAVED) {
            job.setAppliedDate(null);
        } else if (jobRequest.getAppliedDate() != null) {
            job.setAppliedDate(jobRequest.getAppliedDate());
        } else {
            job.setAppliedDate(java.time.LocalDate.now());
        }

        job.setJobUrl(jobRequest.getJobUrl());
        job.setNotes(jobRequest.getNotes());

        job.setUser(user);

        Job savedJob = jobRepository.save(job);

        historyService.recordStatusChange(
                savedJob,
                null,
                savedJob.getStatus()
        );

        return mapToResponse(savedJob);
    }


    public Page<JobResponse> getAllJobs(Pageable pageable){

        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return jobRepository
                .findByUserUsername(username, pageable)
                .map(this::mapToResponse);
    }


    public Page<JobResponse> searchJobs(String keyword, String company,
                                        String location, String jobType,
                                        com.example.jobTrack.entity.ApplicationStatus status ,
                                        Pageable pageable){
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
        Specification<Job> specification =
                JobSpecification.hasUsername(username);
        if (keyword != null && !keyword.isBlank()) {
            specification = specification.and(
                    JobSpecification.hasKeyword(keyword)
            );
        }
        if (company != null && !company.isBlank()) {
            specification = specification.and(
                    JobSpecification.hasCompany(company)
            );
        }
        if (location != null && !location.isBlank()) {
            specification = specification.and(
                    JobSpecification.hasLocation(location)
            );
        }
        if (jobType != null && !jobType.isBlank()) {
            specification = specification.and(
                    JobSpecification.hasJobType(jobType)
            );
        }
        if (status != null) {
            specification = specification.and(
                    JobSpecification.hasStatus(status)
            );
        }
        return jobRepository
                .findAll(specification, pageable)
                .map(this::mapToResponse);
    }


    public JobResponse getJobById(Long id){

        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        Job job = jobRepository.findById(id)
                .filter(foundJob ->
                        foundJob.getUser() != null
                                && foundJob.getUser().getUsername().equals(username))
                .orElseThrow(() ->
                        new JobNotFoundException("Job not found with id: " + id));

        return mapToResponse(job);
    }


    @Transactional
    public void deleteJob(Long id){
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        Job job = jobRepository.findById(id)
                .filter(foundJob ->
                        foundJob.getUser() != null
                                && foundJob.getUser().getUsername().equals(username))
                .orElseThrow(() ->
                        new JobNotFoundException("Job not found with id: " + id));

        jobRepository.delete(job);
    }

    @Transactional
    public JobResponse updateJob(Long id, JobRequest jobRequest){

        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        Job job = jobRepository.findById(id)
                .filter(foundJob ->
                        foundJob.getUser() != null
                                && foundJob.getUser().getUsername().equals(username))
                .orElseThrow(() ->
                        new JobNotFoundException("Job not found with id: " + id));

        job.setTitle(jobRequest.getTitle());
        job.setCompany(jobRequest.getCompany());
        job.setLocation(jobRequest.getLocation());
        job.setJobType(jobRequest.getJobType());
        job.setDescription(jobRequest.getDescription());

        ApplicationStatus previousStatus = job.getStatus();

        if (jobRequest.getStatus() != null) {
            job.setStatus(jobRequest.getStatus());
        }

        if (jobRequest.getStatus() == ApplicationStatus.SAVED) {
            job.setAppliedDate(null);
        } else if (jobRequest.getAppliedDate() != null) {
            job.setAppliedDate(jobRequest.getAppliedDate());
        } else if (job.getAppliedDate() == null) {
            job.setAppliedDate(java.time.LocalDate.now());
        }

        job.setJobUrl(jobRequest.getJobUrl());
        job.setNotes(jobRequest.getNotes());

        Job updatedJob = jobRepository.save(job);

        if (previousStatus != updatedJob.getStatus()) {
            historyService.recordStatusChange(
                    updatedJob,
                    previousStatus,
                    updatedJob.getStatus()
            );
        }
        return mapToResponse(updatedJob);
    }


    private JobResponse mapToResponse(Job job){

        JobResponse jobResponse = new JobResponse();

        jobResponse.setId(job.getId());
        jobResponse.setTitle(job.getTitle());
        jobResponse.setCompany(job.getCompany());
        jobResponse.setLocation(job.getLocation());
        jobResponse.setJobType(job.getJobType());
        jobResponse.setDescription(job.getDescription());
        jobResponse.setStatus(job.getStatus());
        jobResponse.setAppliedDate(job.getAppliedDate());
        jobResponse.setJobUrl(job.getJobUrl());
        jobResponse.setNotes(job.getNotes());

        return jobResponse;
    }

    public DashboardResponse getDashboardStats(){

        String username = org.springframework.security.core.context
                .SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        long totalApplication =
                jobRepository.countByUserUsername(username);

        long saved =jobRepository.countByUserUsernameAndStatus(
                username, ApplicationStatus.SAVED);

        long applied =jobRepository.countByUserUsernameAndStatus(
                username, ApplicationStatus.APPLIED);

        long interview =jobRepository.countByUserUsernameAndStatus(
                username, ApplicationStatus.INTERVIEW);

        long offer =jobRepository.countByUserUsernameAndStatus(
                username, ApplicationStatus.OFFER);

        long rejected =jobRepository.countByUserUsernameAndStatus(
                username, ApplicationStatus.REJECTED);

        return new DashboardResponse(totalApplication, saved,
                applied, interview, offer, rejected
        );
    }

}
