package com.skapp.community.peopleplanner.model;

import com.skapp.community.peopleplanner.type.EmployeeSkillType;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class EmployeeSkillId {

	private Long employee;

	private Long skillId;

	private EmployeeSkillType skillType;

}
