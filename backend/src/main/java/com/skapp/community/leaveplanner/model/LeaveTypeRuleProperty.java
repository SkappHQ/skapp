package com.skapp.community.leaveplanner.model;

import com.skapp.community.common.util.converter.JsonTypeConverter;
import com.skapp.community.leaveplanner.type.EmployeeLeaveEarnMethod;
import com.skapp.community.leaveplanner.type.RulePropertyType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
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
import tools.jackson.databind.JsonNode;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "rule_property")
public class LeaveTypeRuleProperty {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "prop_id")
	private Long propId;

	@Enumerated(EnumType.STRING)
	@Column(name = "property_type", nullable = false, columnDefinition = "varchar(255)")
	private RulePropertyType rulePropertyType;

	@Enumerated(EnumType.STRING)
	@Column(name = "earn_method", nullable = false, columnDefinition = "varchar(255)")
	private EmployeeLeaveEarnMethod employeeLeaveEarnMethod;

	@Column(name = "num_days")
	private int numDays;

	@Column(name = "earn_grid", columnDefinition = "json")
	@Convert(converter = JsonTypeConverter.class)
	private JsonNode earnGrid;

	@ManyToOne(optional = false, fetch = FetchType.EAGER)
	@JoinColumn(name = "rule_id")
	private LeaveTypeRule leaveTypeRule;

}
