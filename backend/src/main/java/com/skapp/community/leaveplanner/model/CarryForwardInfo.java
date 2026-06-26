package com.skapp.community.leaveplanner.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.peopleplanner.model.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "carry_forward_info")
public class CarryForwardInfo extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "info_id")
	private Long infoId;

	@Column(name = "days")
	private Float days;

	@Column(name = "cycle_end_date")
	private LocalDate cycleEndDate;

	@ManyToOne(optional = false)
	@JoinColumn(name = "leave_type_id")
	private LeaveType leaveType;

	@ManyToOne(optional = false)
	@JoinColumn(name = "employee_id")
	private Employee employee;

}
