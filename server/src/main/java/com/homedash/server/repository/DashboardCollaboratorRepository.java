package com.homedash.server.repository;

import com.homedash.server.model.DashboardCollaborator;
import com.homedash.server.model.DashboardCollaboratorId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DashboardCollaboratorRepository extends JpaRepository<DashboardCollaborator, DashboardCollaboratorId> {
    List<DashboardCollaborator> findByIdUserId(Long userId);
}
