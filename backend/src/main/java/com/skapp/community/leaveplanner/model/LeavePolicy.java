package com.skapp.community.leaveplanner.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.leaveplanner.type.AccrualFrequency;
import com.skapp.community.leaveplanner.type.AccrualTiming;
import com.skapp.community.leaveplanner.type.FirstAccrualType;
import com.skapp.community.leaveplanner.type.PolicyType;
import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
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

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "lv_leave_policy")
public class LeavePolicy extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "policy_id")
	private Long policyId;

	@Column(name = "name", nullable = false, columnDefinition = "text")
	private String name;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "leave_type_id", nullable = false)
	private PolicyLeaveType leaveType;

	@Enumerated(EnumType.STRING)
	@Column(name = "policy_type", nullable = false, columnDefinition = "text")
	private PolicyType policyType;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, columnDefinition = "text")
	private LeavePolicyStatus status;

	@Column(name = "accrual_days")
	private Float accrualDays;

	@Enumerated(EnumType.STRING)
	@Column(name = "frequency", columnDefinition = "text")
	private AccrualFrequency frequency;

	@Column(name = "waiting_period_days")
	private Integer waitingPeriodDays;

	@Column(name = "accrual_cap_days")
	private Float accrualCapDays;

	@Column(name = "is_carryover_enabled", nullable = false)
	private Boolean isCarryoverEnabled = false;

	@Column(name = "carryover_date", columnDefinition = "text")
	private String carryoverDate;

	@Column(name = "max_carryover_days")
	private Float maxCarryoverDays;

	@Enumerated(EnumType.STRING)
	@Column(name = "first_accrual", columnDefinition = "text")
	private FirstAccrualType firstAccrual;

	@Enumerated(EnumType.STRING)
	@Column(name = "accrual_timing", columnDefinition = "text")
	private AccrualTiming accrualTiming;

}
