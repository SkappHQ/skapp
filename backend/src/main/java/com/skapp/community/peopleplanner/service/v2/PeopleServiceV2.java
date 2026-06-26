package com.skapp.community.peopleplanner.service.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeFilterDtoV2;

public interface PeopleServiceV2 {

	ResponseEntityDto getEmployees(EmployeeFilterDtoV2 employeeFilterDto);

}
