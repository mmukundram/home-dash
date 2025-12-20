package com.homedash.server.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "dashboard_collaborators")
public class DashboardCollaborator {

    @EmbeddedId
    private DashboardCollaboratorId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @MapsId("dashboardId")
    @JoinColumn(name = "dashboard_id")
    private Dashboard dashboard;

    @Column(nullable = false)
    private String role; // 'viewer', 'editor', 'admin'
}
