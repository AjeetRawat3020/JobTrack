package com.example.jobTrack.controller;

import com.example.jobTrack.dto.ApplicationStatusHistoryResponse;
import com.example.jobTrack.service.ApplicationStatusHistoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class ApplicationStatusHistoryController {

    private final ApplicationStatusHistoryService historyService;

    public ApplicationStatusHistoryController(ApplicationStatusHistoryService historyService){
        this.historyService = historyService;
    }

    @GetMapping("/{jobId}/status-history")
    public List<ApplicationStatusHistoryResponse> getJobStatusHistory(
            @PathVariable Long jobId
    ){
        return historyService.getJobStatusHistory(jobId);
    }

}
