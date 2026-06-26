package com.skapp.community.peopleplanner.model;

import com.skapp.community.leaveplanner.type.ManagerType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "employee_manager")
public class EmployeeManager {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne
	@JoinColumn(name = "employee_id")
	private Employee employee;

	@ManyToOne
	@JoinColumn(name = "manager_id")
	private Employee manager;

	@Column(name = "is_direct_manager")
	private Boolean isPrimaryManager;

	@Column(name = "manager_type", columnDefinition = "varchar(255)")
	@Enumerated(EnumType.STRING)
	private ManagerType managerType;

	public EmployeeManager(EmployeeManager employeeManager) {
		this.id = employeeManager.id;
		this.employee = employeeManager.employee;
		this.manager = employeeManager.manager;
		this.isPrimaryManager = employeeManager.isPrimaryManager;
		this.managerType = employeeManager.managerType;
	}

}
