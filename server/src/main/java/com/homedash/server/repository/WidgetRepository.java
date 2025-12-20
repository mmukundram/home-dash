package com.homedash.server.repository;

import com.homedash.server.model.Widget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WidgetRepository extends JpaRepository<Widget, Long> {
    List<Widget> findByDashboardId(Long dashboardId);
    List<Widget> findByCreatedBy(Long createdBy);
}
