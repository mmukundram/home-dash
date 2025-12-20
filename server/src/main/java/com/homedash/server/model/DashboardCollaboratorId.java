package com.homedash.server.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class DashboardCollaboratorId implements Serializable {
    private Long dashboardId;
    private Long userId;
}
