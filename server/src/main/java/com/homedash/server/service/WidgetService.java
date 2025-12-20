package com.homedash.server.service;

import com.homedash.server.model.Widget;
import com.homedash.server.model.WidgetLocalStore;
import com.homedash.server.repository.WidgetLocalStoreRepository;
import com.homedash.server.repository.WidgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class WidgetService {

    @Autowired
    private WidgetRepository widgetRepository;

    @Autowired
    private WidgetLocalStoreRepository widgetLocalStoreRepository;

    public Widget createWidget(Widget widget) {
        return widgetRepository.save(widget);
    }

    public List<Widget> getWidgetsByDashboardId(Long dashboardId) {
        return widgetRepository.findByDashboardId(dashboardId);
    }

    public List<Widget> getWidgetsByCreator(Long createdBy) {
        return widgetRepository.findByCreatedBy(createdBy);
    }

    @Transactional
    public WidgetLocalStore updateLocalStore(Long widgetId, String key, Map<String, Object> value) {
        WidgetLocalStore store = widgetLocalStoreRepository.findByWidgetIdAndDataKey(widgetId, key)
                .orElse(new WidgetLocalStore());
        
        if (store.getId() == null) {
            store.setWidgetId(widgetId);
            store.setDataKey(key);
        }
        store.setDataValue(value);
        return widgetLocalStoreRepository.save(store);
    }

    @Transactional(readOnly = true)
    public List<WidgetLocalStore> getLocalStore(Long widgetId) {
        return widgetLocalStoreRepository.findByWidgetId(widgetId);
    }

    @Transactional
    public void deleteLocalStoreItem(Long widgetId, String key) {
        widgetLocalStoreRepository.deleteByWidgetIdAndDataKey(widgetId, key);
    }

    public Widget dissociateWidget(Long widgetId) {
        Widget widget = widgetRepository.findById(widgetId).orElseThrow(() -> new RuntimeException("Widget not found"));
        widget.setDashboardId(null);
        return widgetRepository.save(widget);
    }

    @Transactional
    public void deleteWidgetPermanently(Long widgetId) {
        widgetLocalStoreRepository.deleteByWidgetId(widgetId);
        widgetRepository.deleteById(widgetId);
    }

    public Widget updateWidget(Long id, Widget widgetDetails) {
        Widget widget = widgetRepository.findById(id).orElseThrow(() -> new RuntimeException("Widget not found"));
        widget.setTitle(widgetDetails.getTitle());
        widget.setLayoutWidth(widgetDetails.getLayoutWidth());
        widget.setSourceType(widgetDetails.getSourceType());
        widget.setSinkType(widgetDetails.getSinkType());
        widget.setSourceConfig(widgetDetails.getSourceConfig());
        widget.setSinkConfig(widgetDetails.getSinkConfig());
        widget.setInputConfig(widgetDetails.getInputConfig());
        widget.setCreatedBy(widgetDetails.getCreatedBy());
        return widgetRepository.save(widget);
    }
}
