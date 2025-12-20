package com.homedash.server.service;

import com.homedash.server.model.Dashboard;
import com.homedash.server.model.DashboardCollaborator;
import com.homedash.server.model.DashboardCollaboratorId;
import com.homedash.server.model.User;
import com.homedash.server.repository.DashboardCollaboratorRepository;
import com.homedash.server.repository.DashboardRepository;
import com.homedash.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DashboardService {

    @Autowired
    private DashboardRepository dashboardRepository;

    @Autowired
    private DashboardCollaboratorRepository dashboardCollaboratorRepository;
    
    @Autowired
    private UserRepository userRepository;

    public Dashboard createDashboard(Dashboard dashboard) {
        return dashboardRepository.save(dashboard);
    }

    public List<Dashboard> getDashboardsByCreator(Long creatorId) {
        return dashboardRepository.findByCreatedBy(creatorId);
    }

    public Optional<Dashboard> getDashboardById(Long id) {
        return dashboardRepository.findById(id);
    }

    public DashboardCollaborator addCollaborator(Long dashboardId, Long userId, String role) {
        Dashboard dashboard = dashboardRepository.findById(dashboardId).orElseThrow(() -> new RuntimeException("Dashboard not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        DashboardCollaborator collaborator = new DashboardCollaborator();
        DashboardCollaboratorId id = new DashboardCollaboratorId(dashboardId, userId);
        collaborator.setId(id);
        collaborator.setDashboard(dashboard);
        collaborator.setUser(user);
        collaborator.setRole(role);

        return dashboardCollaboratorRepository.save(collaborator);
    }
}
