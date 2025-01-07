package com.skapp.enterprise.people.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;

public interface EpPeopleService {

	ResponseEntityDto getEmployeesLimit();

	boolean checkEmployeesLimit();

	ResponseEntityDto getEmployeeRoleLimit();

	ResponseEntityDto getEmployeesCount();

}
