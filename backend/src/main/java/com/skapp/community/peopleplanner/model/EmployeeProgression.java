package com.skapp.community.peopleplanner.model;

import com.skapp.community.peopleplanner.type.EmploymentType;
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

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "employee_progression")
public class EmployeeProgression {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "progression_id")
	private Long progressionId;

	@Column(name = "employee_type", columnDefinition = "varchar(255)")
	@Enumerated(EnumType.STRING)
	private EmploymentType employmentType;

	@Column(name = "start_date")
	private LocalDate startDate;

	@Column(name = "end_date")
	private LocalDate endDate;

	@Column(name = "is_current")
	private Boolean isCurrent;

	@ManyToOne
	@JoinColumn(name = "employee_id")
	private Employee employee;

	@Column(name = "job_family_id")
	private Long jobFamilyId;

	@Column(name = "job_title_id")
	private Long jobTitleId;

	public EmployeeProgression(EmployeeProgression employeeProgression) {
		this.progressionId = employeeProgression.progressionId;
		this.employmentType = employeeProgression.employmentType;
		this.startDate = employeeProgression.startDate;
		this.endDate = employeeProgression.endDate;
		this.isCurrent = employeeProgression.isCurrent;
		this.jobFamilyId = employeeProgression.jobFamilyId;
		this.jobTitleId = employeeProgression.jobTitleId;
		this.employee = employeeProgression.employee;
	}

}
