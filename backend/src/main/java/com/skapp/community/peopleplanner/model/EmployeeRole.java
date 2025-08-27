package com.skapp.community.peopleplanner.model;

import com.skapp.community.common.type.Role;
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
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "employee_role")
public class EmployeeRole {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "employee_role_id", nullable = false, unique = true, updatable = false)
	private Long employeeRoleId;

	@OneToOne(fetch = FetchType.LAZY)
	@MapsId
	@JoinColumn(name = "employee_id")
	private Employee employee;

	@Enumerated(EnumType.STRING)
	@Column(name = "people_role", length = 20, columnDefinition = "varchar(255)")
	private Role peopleRole;

	@Enumerated(EnumType.STRING)
	@Column(name = "leave_role", length = 20, columnDefinition = "varchar(255)")
	private Role leaveRole;

	@Enumerated(EnumType.STRING)
	@Column(name = "attendance_role", length = 20, columnDefinition = "varchar(255)")
	private Role attendanceRole;

	@Enumerated(EnumType.STRING)
	@Column(name = "esign_role", length = 20, columnDefinition = "varchar(255)")
	private Role esignRole;

	@Enumerated(EnumType.STRING)
	@Column(name = "pm_role", length = 20, columnDefinition = "varchar(255)")
	private Role pmRole;

	@Enumerated(EnumType.STRING)
	@Column(name = "okr_role", length = 20, columnDefinition = "varchar(255)")
	private Role okrRole;

	@Enumerated(EnumType.STRING)
	@Column(name = "invoice_role", length = 20, columnDefinition = "varchar(255)")
	private Role invoiceRole;

	@Column(name = "is_super_admin", nullable = false)
	private Boolean isSuperAdmin = false;

	@Column(name = "permission_changed_date")
	private LocalDate changedDate;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "role_changed_by", referencedColumnName = "employee_id")
	private Employee roleChangedBy;

	public EmployeeRole(EmployeeRole original) {
		if (original != null) {
			this.employeeRoleId = original.getEmployeeRoleId();
			this.employee = original.getEmployee();
			this.peopleRole = original.peopleRole;
			this.leaveRole = original.leaveRole;
			this.attendanceRole = original.attendanceRole;
			this.esignRole = original.esignRole;
			this.okrRole = original.okrRole;
			this.invoiceRole = original.invoiceRole;
			this.pmRole = original.pmRole;
			this.isSuperAdmin = original.isSuperAdmin;
			this.changedDate = original.changedDate;
			this.roleChangedBy = original.roleChangedBy;
		}
	}

}
