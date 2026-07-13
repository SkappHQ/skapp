package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.payload.response.EmployeeSkillResponseDto;

import java.util.List;

public interface EmployeeSkillRepository {

	List<EmployeeSkillResponseDto> getEmployeeSkills(Long employeeId);

}
