
package com.example.jobTrack.repository;

import com.example.jobTrack.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByJobId(Long jobId);

    // Scheduled interviews within a given date-time range
    List<Interview> findByStatusIgnoreCaseAndInterviewDateBetween(
            String status,
            LocalDateTime start,
            LocalDateTime end
    );
}
