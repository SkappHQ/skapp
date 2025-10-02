package com.skapp.enterprise.people.service;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.enterprise.common.payload.response.EpUserAuthPicResponseDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;
import com.skapp.enterprise.common.type.TenantStatus;
import com.skapp.enterprise.common.type.Tier;

import java.util.List;

public interface EpUserService {

	Tier getCurrentUserTier();

	TenantStatus getCurrentUserTenantStatus();

	List<EpUserResponseDto> getUsersByIdsOrSearch(List<Long> employeeIds, String search);

	List<EpUserAuthPicResponseDto> getUserAuthPicsByIdsOrSearch(List<Long> employeeIds, String search);

	List<Employee> getUsersByIds(List<Long> employeeIds);

}
