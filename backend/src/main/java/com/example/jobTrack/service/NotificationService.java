package com.example.jobTrack.service;

import com.example.jobTrack.dto.NotificationResponse;
import com.example.jobTrack.entity.Notification;
import com.example.jobTrack.entity.User;
import com.example.jobTrack.exception.NotificationNotFoundException;
import com.example.jobTrack.repository.NotificationRepository;
import com.example.jobTrack.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    private String getCurrentUsername(){
        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }

    public List<NotificationResponse> getMyNotification(){
        String username = getCurrentUsername();

        return notificationRepository
                .findByUserUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public long getUnreadCount(){
        return notificationRepository
                .countByUserUsernameAndIsReadFalse(getCurrentUsername());
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = getOwnedNotification(notificationId);
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        List<Notification> notifications =
                notificationRepository
                        .findByUserUsernameOrderByCreatedAtDesc(getCurrentUsername());

        notifications.forEach(notification -> notification.setRead(true));

        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        Notification notification = getOwnedNotification(notificationId);
        notificationRepository.delete(notification);
    }

    @Transactional
    public void createNotification(
            String title,
            String message,
            String type,
            User user
    ) {
        Notification notification = new Notification();

        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setUser(user);

        notificationRepository.save(notification);
    }

    private Notification getOwnedNotification(Long notificationId) {
        return notificationRepository
                .findByIdAndUserUsername(
                        notificationId,
                        getCurrentUsername()
                )
                .orElseThrow(() ->
                        new NotificationNotFoundException("Notification not found")
                );
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

}
