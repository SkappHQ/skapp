package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;

public interface PeopleReadService {

	ResponseEntityDto getEmployeeById(Long employeeId);

}
