package com.skapp.community.leaveplanner.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.leaveplanner.type.EffectiveDateType;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyEndedReason;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import com.skapp.community.peopleplanner.model.Employee;
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

import java.time.LocalDate;

/**
 * Effective-dated assignment window linking an {@link Employee} to a {@link LeavePolicy}.
 * <p>
 * Rows are append-only: an assignment is never hard-deleted. Unassigning (or being
 * superseded by a newer policy of the same leave type, or the policy being deactivated)
 * closes the window by setting {@code effectiveTo}, flipping {@code status} to
 * {@code ENDED} and recording an {@code endedReason}. At most one window per (employee,
 * policy leave type) is open ({@code effectiveTo IS NULL}, {@code status = ACTIVE}) at a
 * time; enforced in the service layer since leave type is only reachable through the
 * policy.
 * <p>
 * Table {@code lv_employee_leave_policy} is created by the shared leave-policy foundation
 * migration; {@code effective_date_type} is added by this feature's ALTER migration.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "lv_employee_leave_policy")
public class EmployeeLeavePolicy extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "employee_id", nullable = false)
	private Employee employee;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "policy_id", nullable = false)
	private LeavePolicy policy;

	@Enumerated(EnumType.STRING)
	@Column(name = "effective_date_type", nullable = false)
	private EffectiveDateType effectiveDateType;

	@Column(name = "effective_from", nullable = false)
	private LocalDate effectiveFrom;

	@Column(name = "effective_to")
	private LocalDate effectiveTo;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private EmployeeLeavePolicyStatus status;

	@Enumerated(EnumType.STRING)
	@Column(name = "ended_reason")
	private EmployeeLeavePolicyEndedReason endedReason;

}
