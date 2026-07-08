package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.peopleplanner.type.EmployeeSkillType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeSkillDto {

	private Long skillId;

	private EmployeeSkillType skillType;

	private String name;

}
