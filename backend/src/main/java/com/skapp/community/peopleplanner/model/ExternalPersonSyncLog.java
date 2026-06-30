package com.skapp.community.peopleplanner.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "external_person_sync_log")
public class ExternalPersonSyncLog {

    public enum SyncChannel { GOOGLE, MICROSOFT }

    public enum SyncType { MANUAL, AUTO, WEBHOOK }

    public enum SyncStatus { COMPLETED, FAILED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "sync_channel", nullable = false, length = 20)
    private SyncChannel syncChannel;

    @Enumerated(EnumType.STRING)
    @Column(name = "sync_type", nullable = false, length = 20)
    private SyncType syncType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SyncStatus status;

    @Column(name = "initiated_by")
    private String initiatedBy;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "total_staged", nullable = false)
    private int totalStaged = 0;

    @Column(name = "total_failed", nullable = false)
    private int totalFailed = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
