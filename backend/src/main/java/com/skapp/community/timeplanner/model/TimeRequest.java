package com.skapp.community.timeplanner.model;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.type.RequestStatus;
import com.skapp.community.peopleplanner.type.RequestType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "time_request")
public class TimeRequest {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "time_request_id", updatable = false)
	private Long timeRequestId;

	@Column(name = "requested_start_time")
	private Long requestedStartTime;

	@Column(name = "requested_end_time")
	private Long requestedEndTime;

	@Column(name = "initial_clock_in")
	private Long initialClockIn;

	@Column(name = "initial_clock_out")
	private Long initialClockOut;

	@Column(name = "work_hours")
	private Float workHours;

	@Column(name = "break_hours")
	private Float breakHours;

	@Column(name = "status", nullable = false, columnDefinition = "varchar(255)")
	@Enumerated(EnumType.STRING)
	private RequestStatus status;

	@Column(name = "request_type", nullable = false, columnDefinition = "varchar(255)")
	@Enumerated(EnumType.STRING)
	private RequestType requestType;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "time_record_id")
	private TimeRecord timeRecord;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "employee_id", nullable = false)
	private Employee employee;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "reviewer_id")
	private Employee reviewerId;

	@Column(name = "reviewed_at")
	private LocalDateTime reviewedAt;

	@Column(name = "created_date", updatable = false, nullable = false)
	private LocalDateTime creationDate;

}
