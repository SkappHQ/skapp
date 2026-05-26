package com.skapp.enterprise.timeplanner.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "adms_attendance_log")
public class AdmsAttendanceLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", updatable = false)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "device_id", nullable = false)
	private AdmsDevice device;

	@Column(name = "pin", nullable = false)
	private String pin;

	@Column(name = "punched_at", nullable = false)
	private LocalDateTime punchedAt;

	@Column(name = "status")
	private Integer status;

	@Column(name = "verify_type")
	private Integer verifyType;

	@Column(name = "work_code")
	private Integer workCode;

	@Column(name = "raw_data")
	private String rawData;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

}
