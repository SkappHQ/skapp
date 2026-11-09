package com.skapp.community.peopleplanner.model;

import com.skapp.community.common.model.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "ppl_employee_billable_rate")
public class EmployeeBillableRate extends Auditable<String> {

	@Id
	@Column(name = "employee_id")
	private Long employeeId;

	@OneToOne(fetch = FetchType.LAZY)
	@MapsId
	@JoinColumn(name = "employee_id")
	private Employee employee;

	@Column(name = "billable_rate")
	private Double billableRate;

	@Column(name = "currency")
	private String currency;

}
