package com.example.jobTrack.repository;

import com.example.jobTrack.entity.ApplicationStatus;
import com.example.jobTrack.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface JobRepository extends JpaRepository<Job,Long>, JpaSpecificationExecutor<Job> {

    List<Job> findByUserUsername(String username);

    Page<Job> findByUserUsername(String username, Pageable pageable);

    long countByUserUsernameAndStatus(String username, ApplicationStatus status);

    long countByUserUsername(String username);

}
