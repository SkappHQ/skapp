package com.skapp.community.peopleplanner.model;

import com.skapp.community.peopleplanner.type.SkillType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
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
@IdClass(EmployeeSkillId.class)
@Table(name = "ppl_employee_skill")
public class EmployeeSkill {

	@Id
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "employee_id", nullable = false)
	private Employee employee;

	@Id
	@Column(name = "skill_id", nullable = false)
	private Long skillId;

	@Id
	@Enumerated(EnumType.STRING)
	@Column(name = "skill_type", nullable = false)
	private SkillType skillType;

}
