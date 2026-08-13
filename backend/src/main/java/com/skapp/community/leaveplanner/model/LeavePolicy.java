package com.skapp.community.leaveplanner.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.leaveplanner.type.AccrualFrequency;
import com.skapp.community.leaveplanner.type.AccrualTiming;
import com.skapp.community.leaveplanner.type.FirstAccrualType;
import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
import com.skapp.community.leaveplanner.type.PolicyType;
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
	@Column(name = "id")
	private Long id;

	@Column(name = "name", nullable = false)
	private String name;

	@ManyToOne(optional = false, fetch = FetchType.EAGER)
	@JoinColumn(name = "leave_type_id", nullable = false)
	private PolicyLeaveType leaveType;

	@Enumerated(EnumType.STRING)
	@Column(name = "policy_type", nullable = false)
	private PolicyType policyType;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private LeavePolicyStatus status;

	@Column(name = "accrual_days")
	private Float accrualDays;

	@Enumerated(EnumType.STRING)
	@Column(name = "frequency")
	private AccrualFrequency frequency;

	@Column(name = "waiting_period_days")
	private Integer waitingPeriodDays;

	@Column(name = "accrual_cap_days")
	private Float accrualCapDays;

	@Column(name = "is_carryover_enabled", nullable = false)
	private Boolean isCarryoverEnabled = Boolean.FALSE;

	@Column(name = "carryover_date")
	private String carryoverDate;

	@Column(name = "max_carryover_days")
	private Float maxCarryoverDays;

	@Enumerated(EnumType.STRING)
	@Column(name = "first_accrual")
	private FirstAccrualType firstAccrual;

	@Enumerated(EnumType.STRING)
	@Column(name = "accrual_timing")
	private AccrualTiming accrualTiming;

}
