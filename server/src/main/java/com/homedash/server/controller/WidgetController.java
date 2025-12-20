package com.homedash.server.controller;

import com.homedash.server.model.Widget;
import com.homedash.server.model.WidgetLocalStore;
import com.homedash.server.service.WidgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/widgets")
@CrossOrigin(origins = "*")
public class WidgetController {

    @Autowired
    private WidgetService widgetService;

    @PostMapping
    public ResponseEntity<Widget> createWidget(@RequestBody Widget widget) {
        return ResponseEntity.ok(widgetService.createWidget(widget));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Widget> updateWidget(@PathVariable Long id, @RequestBody Widget widget) {
        return ResponseEntity.ok(widgetService.updateWidget(id, widget));
    }

    @GetMapping("/dashboard/{dashboardId}")
    public ResponseEntity<List<Widget>> getWidgetsByDashboard(@PathVariable Long dashboardId) {
        return ResponseEntity.ok(widgetService.getWidgetsByDashboardId(dashboardId));
    }

    @PostMapping("/{widgetId}/local-store")
    public ResponseEntity<WidgetLocalStore> updateLocalStore(
            @PathVariable Long widgetId,
            @RequestBody Map<String, Object> body) {
        
        String key = (String) body.get("key");
        Map<String, Object> value = (Map<String, Object>) body.get("value");
        
        if (key == null) {
            throw new RuntimeException("key is required");
        }
        
        return ResponseEntity.ok(widgetService.updateLocalStore(widgetId, key, value));
    }

    @GetMapping("/{widgetId}/local-store")
    public ResponseEntity<List<WidgetLocalStore>> getLocalStore(@PathVariable Long widgetId) {
        return ResponseEntity.ok(widgetService.getLocalStore(widgetId));
    }

    @DeleteMapping("/{widgetId}/local-store/{key}")
    public ResponseEntity<Void> deleteLocalStoreItem(@PathVariable Long widgetId, @PathVariable String key) {
        widgetService.deleteLocalStoreItem(widgetId, key);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/dissociate")
    public ResponseEntity<Widget> dissociateWidget(@PathVariable Long id) {
        return ResponseEntity.ok(widgetService.dissociateWidget(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWidget(@PathVariable Long id) {
        widgetService.deleteWidgetPermanently(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<List<Widget>> getWidgetsByCreator(@PathVariable Long creatorId) {
        return ResponseEntity.ok(widgetService.getWidgetsByCreator(creatorId));
    }
}
