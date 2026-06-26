package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.type.EmployeeSkillType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSkillResponseDto {

	private Long id;

	private String name;

	private EmployeeSkillType skillType;

}
