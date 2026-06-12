package com.skapp.community.peopleplanner.service;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeSkill;
import com.skapp.community.peopleplanner.payload.request.EmployeeSkillDto;
import com.skapp.community.peopleplanner.payload.response.SkillResponseDto;

import java.util.List;

public interface SkillService {

	List<EmployeeSkill> saveEmployeeSkills(Employee employee, List<EmployeeSkillDto> skills);

	List<SkillResponseDto> getEmployeeSkillResponses(Long employeeId);

}
