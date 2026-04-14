package com.crm.enterprise.controller;

import com.crm.enterprise.dto.AnalyticsDashboardDto;
import com.crm.enterprise.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsDashboardDto> getDashboardData() {
        return ResponseEntity.ok(analyticsService.buildDashboard());
    }
}
