package com.example.jobTrack.repository;

import com.example.jobTrack.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserUsernameOrderByCreatedAtDesc(String username);

    long countByUserUsernameAndIsReadFalse(String username);

    Optional<Notification> findByIdAndUserUsername(Long id, String username);

}
