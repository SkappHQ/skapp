package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.peopleplanner.type.SkillType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeSkillDto {

	private Long skillId;

	private SkillType skillType;

	private String name;

}
