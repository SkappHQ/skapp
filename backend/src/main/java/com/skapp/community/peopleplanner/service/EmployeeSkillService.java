package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeSkill;
import com.skapp.community.peopleplanner.payload.request.EmployeeSkillDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeSkillResponseDto;

import java.util.List;

public interface EmployeeSkillService {

	List<EmployeeSkill> saveEmployeeSkills(Employee employee, List<EmployeeSkillDto> skills);

	List<EmployeeSkillResponseDto> getEmployeeSkillResponses(Long employeeId);

	ResponseEntityDto getAllSkills();

}
