package com.skapp.enterprise.people.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;

import java.util.List;

public interface EpPeopleService {

	ResponseEntityDto getEmployeesLimit();

	boolean checkEmployeesLimit();

	ResponseEntityDto getEmployeeRoleLimit();

	ResponseEntityDto getEmployeesCount();

	ResponseEntityDto getEmployeesByIdList(List<Long> employeeIds);

}
