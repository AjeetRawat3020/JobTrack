package com.example.jobTrack;


import com.example.jobTrack.dto.JobRequest;
import com.example.jobTrack.dto.JobResponse;
import com.example.jobTrack.entity.Job;
import com.example.jobTrack.entity.User;
import com.example.jobTrack.exception.JobNotFoundException;
import com.example.jobTrack.repository.JobRepository;
import com.example.jobTrack.repository.UserRepository;
import com.example.jobTrack.service.JobService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;


import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class JobServiceTes {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JobService jobService;

    @Test
    void jobServiceIsCreated(){

        assertNotNull(jobService);

    }

    @Test
    void getAllJobsReturnsOnlyCurrentUserJobs(){

        var pageable = PageRequest.of(0,10);

        var authentication =
                new UsernamePasswordAuthenticationToken(
                        "ajeet", null, List.of()
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);

        Job job = new Job();
        job.setTitle("Java Developer");
        job.setCompany("Company One");
        job.setLocation("Jaipur");
        job.setJobType("Full_Time");
        job.setDescription("Test job");

        Page<Job> jobPage = new PageImpl<>(List.of(job));

        when(jobRepository.findByUserUsername("ajeet", pageable))
                .thenReturn(jobPage);

        Page<JobResponse> result = jobService.getAllJobs(pageable);

        assertEquals(1, result.getTotalElements());
        verify(jobRepository).findByUserUsername("ajeet", pageable);

        SecurityContextHolder.clearContext();

        assertEquals("Java Developer", result.getContent().get(0).getTitle());

    }

    @Test
    void getJobByIdThrowExceptionForAnotherUsersJob(){

        try{
            var authentication = new UsernamePasswordAuthenticationToken(
                    "ajeet", null, List.of()
            );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            User owner = new User();
            owner.setUsername("ankit");

            Job otherUsersJob = new Job();
            otherUsersJob.setId(14L);
            otherUsersJob.setUser(owner);

            when(jobRepository.findById(14L))
                    .thenReturn(java.util.Optional.of(otherUsersJob));

            assertThrows(
                    JobNotFoundException.class,
                    ()->jobService.getJobById(14L)
            );

            verify(jobRepository).findById(14L);
        } finally{
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    void updateJobThrowsExceptionForAnotherUsersJob(){
        try{
            var authentication = new UsernamePasswordAuthenticationToken(
                    "ajeet", null, List.of()
            );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            User owner = new User();
            owner.setUsername("ankit");

            Job otherUsersJob = new Job();
            otherUsersJob.setId(14L);
            otherUsersJob.setUser(owner);

            when(jobRepository.findById(14L))
                    .thenReturn(java.util.Optional.of(otherUsersJob));

            JobRequest request = new JobRequest();

            assertThrows(JobNotFoundException.class,
                    ()->jobService.updateJob(14L, request));

            verify(jobRepository).findById(14L);
            org.mockito.Mockito.verify(
                    jobRepository,
                    org.mockito.Mockito.never()
            ).save(org.mockito.ArgumentMatchers.any(Job.class));
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    void deleteJobThrowsExceptionForAnotherUsersJob(){
        try{
            var authentication = new UsernamePasswordAuthenticationToken(
                    "ajeet", null, List.of()
            );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            User owner = new User();
            owner.setUsername("ankit");

            Job otherUsersJob = new Job();
            otherUsersJob.setId(14L);
            otherUsersJob.setUser(owner);

            when(jobRepository.findById(14L))
                    .thenReturn(java.util.Optional.of(otherUsersJob));

            assertThrows(JobNotFoundException.class,
                    ()->jobService.deleteJob(14L));

            verify(jobRepository).findById(14L);

            org.mockito.Mockito.verify(
                    jobRepository,
                    org.mockito.Mockito.never()
            ).delete(org.mockito.ArgumentMatchers.any(Job.class));

        }finally {

            SecurityContextHolder.clearContext();

        }
    }

    @Test
    void updateJobSeccessfullyForItsOwner(){
        try{
            var authentication = new UsernamePasswordAuthenticationToken(
                    "ajeet", null, List.of()
            );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            User owner = new User();
            owner.setUsername("ajeet");

            Job existingJob = new Job();
            existingJob.setId(13L);
            existingJob.setTitle("Java Developer");
            existingJob.setCompany("Old Company");
            existingJob.setUser(owner);

            JobRequest request = new JobRequest();
            request.setTitle("Senior Java Developer");
            request.setCompany("New Company");
            request.setLocation("Jaipur");
            request.setJobType("Full_Time");
            request.setDescription("Updated description");

            when(jobRepository.findById(13L))
                    .thenReturn(java.util.Optional.of(existingJob));

            when(jobRepository.save(existingJob))
                    .thenReturn(existingJob);

            JobResponse result = jobService.updateJob(13L, request);

            assertEquals("Senior Java Developer", result.getTitle());
            assertEquals("New Company", result.getCompany());

            verify(jobRepository).save(existingJob);

        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    void deleteJobSuccessfullyForItsOwner(){
        try{
            var authentication = new UsernamePasswordAuthenticationToken(
                    "ajeet", null, List.of()
            );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            User owner = new User();
            owner.setUsername("ajeet");

            Job existingJob = new Job();
            existingJob.setId(13L);
            existingJob.setTitle("Java Developer");
            existingJob.setUser(owner);

            when(jobRepository.findById(13L))
                    .thenReturn(java.util.Optional.of(existingJob));

            jobService.deleteJob(13L);

            verify(jobRepository).delete(existingJob);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    void getJobByIdThrowsExceptionWhenJobDoesNotExist(){
        try{
            var authentication = new UsernamePasswordAuthenticationToken(
                    "ajeet", null, List.of()
            );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            when(jobRepository.findById(999L))
                    .thenReturn(java.util.Optional.empty());

            assertThrows(
                    JobNotFoundException.class,
                    ()->jobService.getJobById(999L)
            );

            verify(jobRepository).findById(999L);

        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    void deleteJobThrowsExceptionWhenJobDoesNotExist(){
        try{
            var authentication = new UsernamePasswordAuthenticationToken(
                    "ajeet", null, List.of()
            );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            when(jobRepository.findById(999L))
                    .thenReturn(java.util.Optional.empty());

            assertThrows(
                    JobNotFoundException.class,
                    ()->jobService.deleteJob(999L)
            );

            verify(jobRepository).findById(999L);

            org.mockito.Mockito.verify(
                    jobRepository,
                    org.mockito.Mockito.never()
            ).delete(org.mockito.ArgumentMatchers.any(Job.class));

        }finally {
            SecurityContextHolder.clearContext();
        }
    }

}
