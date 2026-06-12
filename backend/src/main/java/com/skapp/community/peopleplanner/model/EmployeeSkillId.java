package com.skapp.community.peopleplanner.model;

import com.skapp.community.peopleplanner.type.SkillType;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class EmployeeSkillId implements Serializable {

	private Long employee;

	private Long skillId;

	private SkillType skillType;

}
