package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeSkillDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeSkillResponseDto;

import java.util.List;

public interface EmployeeSkillService {

	Long saveCustomSkill(EmployeeSkillDto skillDto);

	List<EmployeeSkillResponseDto> getEmployeeSkills(Long employeeId);

	ResponseEntityDto getAllCustomSkills();

}
