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
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "lv_leave_request")
public class PolicyLeaveRequest extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "employee_id", nullable = false, updatable = false)
	private Employee employee;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reviewer_id")
	private Employee reviewer;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "policy_id", nullable = false)
	private LeavePolicy policy;

	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;

	@Column(name = "end_date", nullable = false)
	private LocalDate endDate;

	@Enumerated(EnumType.STRING)
	@Column(name = "leave_state", nullable = false)
	private LeaveState leaveState;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private LeaveRequestStatus status;

	@Column(name = "duration_days", nullable = false)
	private Float durationDays;

	@Column(name = "description")
	private String requestDesc;

	@Column(name = "reviewer_comment")
	private String reviewerComment;

	@Column(name = "reviewed_date")
	private LocalDateTime reviewedDate;

	@Column(name = "is_auto_approved")
	private Boolean isAutoApproved = Boolean.FALSE;

	@Column(name = "is_viewed")
	private Boolean isViewed = Boolean.FALSE;

	@Column(name = "event_id")
	private String eventId;

	@OneToMany(mappedBy = "leaveRequest", cascade = CascadeType.ALL)
	private List<PolicyLeaveRequestAttachment> attachments;

}
