package com.example.jobTrack.service;

import com.example.jobTrack.entity.Interview;
import com.example.jobTrack.entity.Job;
import com.example.jobTrack.repository.InterviewRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class InterviewRemainderService {

    private final InterviewRepository interviewRepository;
    private final NotificationService notificationService;

    public InterviewRemainderService(
            InterviewRepository interviewRepository,
            NotificationService notificationService
    ){
        this.interviewRepository = interviewRepository;
        this.notificationService = notificationService;
    }

    // Har 1 minute mein reminders check karo
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkInterviewReminders() {

        LocalDateTime now = LocalDateTime.now();

        // 24-hour reminder: 2 minutes before/after target
        checkOneDayReminders(
                now.plusHours(24).minusMinutes(2),
                now.plusHours(24).plusMinutes(2)
        );

        // 1-hour reminder: 2 minutes before/after target
        checkOneHourReminders(
                now.plusHours(1).minusMinutes(2),
                now.plusHours(1).plusMinutes(2)
        );
    }

    // 24-hour reminders
    private void checkOneDayReminders(
            LocalDateTime start,
            LocalDateTime end
    ) {
        List<Interview> interviews =
                interviewRepository
                        .findByStatusIgnoreCaseAndInterviewDateBetween(
                                "Scheduled", start, end
                        );

        for (Interview interview : interviews) {

            if (!interview.isOneDayReminderSent()) {

                Job job = interview.getJob();

                String message =
                        "Your interview for "
                                + job.getTitle()
                                + " at "
                                + job.getCompany()
                                + " is scheduled tomorrow. Round: "
                                + interview.getRound()
                                + ". Interview time: "
                                + formatDate(interview.getInterviewDate());

                notificationService.createNotification(
                        "Interview Tomorrow!",
                        message,
                        "REMINDER",
                        job.getUser()
                );

                interview.setOneDayReminderSent(true);

                interviewRepository.save(interview);
            }
        }
    }

    // 1-hour reminders
    private void checkOneHourReminders(
            LocalDateTime start,
            LocalDateTime end
    ) {
        List<Interview> interviews =
                interviewRepository
                        .findByStatusIgnoreCaseAndInterviewDateBetween(
                                "Scheduled", start, end
                        );

        for (Interview interview : interviews) {

            if (!interview.isOneHourReminderSent()) {

                Job job = interview.getJob();

                String message =
                        "Your interview for "
                                + job.getTitle()
                                + " at "
                                + job.getCompany()
                                + " starts in approximately 1 hour. Round: "
                                + interview.getRound()
                                + ". Interview time: "
                                + formatDate(interview.getInterviewDate());

                notificationService.createNotification(
                        "Interview in 1 Hour!",
                        message,
                        "REMINDER",
                        job.getUser()
                );

                interview.setOneHourReminderSent(true);

                interviewRepository.save(interview);
            }
        }
    }

    // Format interview date and time
    private String formatDate(LocalDateTime dateTime) {
        return dateTime.format(
                DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")
        );
    }

}
