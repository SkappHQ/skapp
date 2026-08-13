package com.skapp.community.leaveplanner.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.leaveplanner.type.EffectiveDateType;
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

	@ManyToOne(optional = false, fetch = FetchType.EAGER)
	@JoinColumn(name = "policy_id", nullable = false)
	private LeavePolicy policy;

	@Enumerated(EnumType.STRING)
	@Column(name = "effective_date_type", nullable = false)
	private EffectiveDateType effectiveDateType;

	@Column(name = "effective_from", nullable = false)
	private LocalDate effectiveFrom;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private EmployeeLeavePolicyStatus status;

}
