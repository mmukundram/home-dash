package com.homedash.server.repository;

import com.homedash.server.model.Dashboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DashboardRepository extends JpaRepository<Dashboard, Long> {
    List<Dashboard> findByCreatedBy(Long createdBy);
}
