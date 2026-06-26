package com.skapp.community.leaveplanner.model;

import com.skapp.community.leaveplanner.type.GainEligibilityType;
import com.skapp.community.leaveplanner.type.LeaveRuleCategory;
import com.skapp.community.leaveplanner.type.LeaveRuleEmployeeType;
import com.skapp.community.leaveplanner.type.LoseEligibilityType;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "type_rule")
public class LeaveTypeRule {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "rule_id")
	private Long ruleId;

	@Column(name = "name", unique = true)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(name = "rule_category", nullable = false, columnDefinition = "varchar(255)")
	private LeaveRuleCategory leaveRuleCategory;

	@Enumerated(EnumType.STRING)
	@Column(name = "employee_type", nullable = false, columnDefinition = "varchar(255)")
	private LeaveRuleEmployeeType leaveRuleEmployeeType;

	@Enumerated(EnumType.STRING)
	@Column(name = "gain_eligible_type", nullable = false, columnDefinition = "varchar(255)")
	private GainEligibilityType gainEligibilityType;

	@Enumerated(EnumType.STRING)
	@Column(name = "lose_eligible_type", nullable = false, columnDefinition = "varchar(255)")
	private LoseEligibilityType loseEligibilityType;

	@ManyToOne(optional = false, fetch = FetchType.EAGER)
	@JoinColumn(name = "type_id")
	private LeaveType leaveType;

	@Column(name = "each_year_applicable")
	private boolean eachYearApplicable = Boolean.FALSE;

	@Column(name = "valid_from")
	private LocalDate validFrom;

	@Column(name = "is_active")
	private boolean isActive;

	@OneToMany(mappedBy = "leaveTypeRule", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
	private List<LeaveTypeRuleProperty> leaveTypeRuleProperties;

}
