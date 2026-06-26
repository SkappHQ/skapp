package com.skapp.community.leaveplanner.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.peopleplanner.model.Employee;
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

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "leave_entitlement")
public class LeaveEntitlement extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "entitlement_id")
	private Long entitlementId;

	@Column(name = "total_days_allocated", nullable = false)
	private Float totalDaysAllocated;

	@Column(name = "total_days_used", nullable = false)
	private Float totalDaysUsed;

	@Column(name = "valid_from", nullable = false)
	private LocalDate validFrom;

	@Column(name = "valid_to", nullable = false)
	private LocalDate validTo;

	@Column(name = "is_active", nullable = false)
	private boolean isActive = true;

	@Column(name = "reason", length = 40)
	private String reason;

	@Column(name = "is_manual", nullable = false)
	private boolean isManual = false;

	@Column(name = "is_override", nullable = false)
	private boolean isOverride = false;

	@ManyToOne(optional = false, fetch = FetchType.EAGER)
	@JoinColumn(name = "leave_type_id")
	private LeaveType leaveType;

	@ManyToOne(optional = false)
	@JoinColumn(name = "employee_id")
	private Employee employee;

}
