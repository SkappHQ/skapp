package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.CustomSkillRequestDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeSkillResponseDto;

import java.util.List;

public interface EmployeeSkillService {

	ResponseEntityDto saveCustomSkills(CustomSkillRequestDto customSkillRequestDto);

	List<EmployeeSkillResponseDto> getEmployeeSkills(Long employeeId);

	ResponseEntityDto getAllCustomSkills();

}
