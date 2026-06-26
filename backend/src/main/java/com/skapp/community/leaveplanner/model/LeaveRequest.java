package com.skapp.community.leaveplanner.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.peopleplanner.model.Employee;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "leave_request")
public class LeaveRequest extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "leave_req_id", updatable = false)
	private Long leaveRequestId;

	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;

	@Column(name = "end_date", nullable = false)
	private LocalDate endDate;

	@Enumerated(EnumType.STRING)
	@Column(name = "leave_state", nullable = false, columnDefinition = "varchar(255)")
	private LeaveState leaveState;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, columnDefinition = "varchar(255)")
	private LeaveRequestStatus status;

	@Column(name = "description")
	private String requestDesc;

	@Column(name = "reviewer_comment")
	private String reviewerComment;

	@Column(name = "reviewed_date")
	private LocalDateTime reviewedDate;

	@Column(name = "duration_days")
	private Float durationDays;

	@Column(name = "is_viewed")
	private boolean isViewed = false;

	@Column(name = "event_id")
	private String eventId;

	@ManyToOne(optional = false, fetch = FetchType.EAGER)
	@JoinColumn(name = "employee_id", updatable = false)
	private Employee employee;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "reviewer_id")
	private Employee reviewer;

	@ManyToOne(optional = false, fetch = FetchType.EAGER)
	@JoinColumn(name = "type_id")
	private LeaveType leaveType;

	@Column(name = "is_auto_approved")
	private Boolean isAutoApproved = false;

	@OneToMany(mappedBy = "leaveRequest", cascade = CascadeType.ALL)
	private Set<LeaveRequestAttachment> attachments;

}
