package com.homedash.server.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Entity
@Table(name = "widget_local_store")
public class WidgetLocalStore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "widget_id")
    private Long widgetId;

    @Column(name = "data_key", nullable = false)
    private String dataKey;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data_value", columnDefinition = "jsonb")
    private Map<String, Object> dataValue;

    @CreationTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
