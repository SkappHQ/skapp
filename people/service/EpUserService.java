package com.skapp.enterprise.people.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.enterprise.common.payload.response.EpUserAuthPicResponseDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;
import com.skapp.enterprise.common.type.TenantStatus;
import com.skapp.enterprise.common.type.Tier;

import java.util.List;

public interface EpUserService {

	List<Tier> getCurrentUserTiers();

	TenantStatus getCurrentUserTenantStatus();

	List<EpUserResponseDto> getAllUsersOrByIds(List<Long> employeeIds);

	List<EpUserAuthPicResponseDto> getAllUserAuthPicsOrByIds(List<Long> employeeIds);

	List<Employee> getUsersByIds(List<Long> employeeIds);

	EpUserResponseDto mapEmployeeToUserDto(Employee employee);

	ResponseEntityDto getUserStatus(String email);

}
