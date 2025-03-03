package com.skapp.enterprise.peopleplanner.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.enterprise.peopleplanner.type.EpEmployeeTimelineType;
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
@Table(name = "employee_timeline")
public class EmployeeTimeline extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "timeline_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "employee_id")
	private Employee employee;

	@Column(name = "timeline_type", columnDefinition = "varchar(255)")
	@Enumerated(EnumType.STRING)
	private EpEmployeeTimelineType timelineType;

	@Column(name = "previous_value")
	private String previousValue;

	@Column(name = "new_value")
	private String newValue;

}
