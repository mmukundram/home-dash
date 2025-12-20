package com.homedash.server.controller;

import com.homedash.server.model.Dashboard;
import com.homedash.server.model.DashboardCollaborator;
import com.homedash.server.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboards")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @PostMapping
    public ResponseEntity<Dashboard> createDashboard(@RequestBody Dashboard dashboard) {
        return ResponseEntity.ok(dashboardService.createDashboard(dashboard));
    }

    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<List<Dashboard>> getDashboardsByCreator(@PathVariable Long creatorId) {
        return ResponseEntity.ok(dashboardService.getDashboardsByCreator(creatorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dashboard> getDashboardById(@PathVariable Long id) {
        return dashboardService.getDashboardById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{dashboardId}/collaborators")
    public ResponseEntity<DashboardCollaborator> addCollaborator(
            @PathVariable Long dashboardId,
            @RequestBody Map<String, Object> body) {
        
        Integer userIdInt = (Integer) body.get("userId"); // JSON integers often come as Integer
        String role = (String) body.get("role");
        
        if (userIdInt == null || role == null) {
            throw new RuntimeException("userId and role are required");
        }
        
        Long userId = Long.valueOf(userIdInt);
        return ResponseEntity.ok(dashboardService.addCollaborator(dashboardId, userId, role));
    }
}
