package com.homedash.server.repository;

import com.homedash.server.model.WidgetLocalStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WidgetLocalStoreRepository extends JpaRepository<WidgetLocalStore, Long> {
    Optional<WidgetLocalStore> findByWidgetIdAndDataKey(Long widgetId, String dataKey);
    java.util.List<WidgetLocalStore> findByWidgetId(Long widgetId);
    void deleteByWidgetIdAndDataKey(Long widgetId, String dataKey);
    void deleteByWidgetId(Long widgetId);
}
