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
@Table(name = "widgets")
public class Widget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dashboard_id")
    private Long dashboardId;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "layout_offset", nullable = false)
    private Integer layoutOffset;

    @Column(name = "layout_width", nullable = false)
    private Integer layoutWidth;

    @Column(name = "source_type", nullable = false)
    private String sourceType;

    @Column(name = "sink_type", nullable = false)
    private String sinkType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "source_config", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> sourceConfig;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sink_config", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> sinkConfig;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "input_config", columnDefinition = "jsonb")
    private Map<String, Object> inputConfig;

    private String title;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
