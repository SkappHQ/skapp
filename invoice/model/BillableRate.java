package com.skapp.enterprise.invoice.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.enterprise.invoice.type.BillableFrequency;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "in_project_member_billable_rate")
public class BillableRate extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "employee_id")
	private Employee employee;

	@ManyToOne
	@JoinColumns({ @JoinColumn(name = "project_id", referencedColumnName = "project_id"),
			@JoinColumn(name = "customer_id", referencedColumnName = "customer_id") })
	private Project project;

	@Column(name = "billable_rate")
	private Double billableRate;

	@Enumerated(EnumType.STRING)
	@Column(name = "billable_frequency")
	private BillableFrequency billableFrequency;

	@Column(name = "is_active")
	private Boolean isActive;

}
