package com.skapp.community.common.service.impl;

import com.skapp.community.common.payload.response.OrganizationStatusResponseDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.service.AppSetupStatusService;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppSetupServiceImpl implements AppSetupStatusService {

	private final OrganizationConfigDao organizationConfigDao;

	private final EmployeeRoleDao employeeRoleDao;

	@Override
	public ResponseEntityDto getAppSetupStatus() {
		log.info("getAppSetupStatus: execution started");

		OrganizationStatusResponseDto organizationStatusResponseDto = new OrganizationStatusResponseDto();
		organizationStatusResponseDto.setIsOrganizationSetupCompleted(organizationConfigDao.count() > 0);
		organizationStatusResponseDto.setIsSignUpCompleted(employeeRoleDao
			.existsByIsSuperAdminTrueAndEmployee_AccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING)));

		log.info("getAppSetupStatus: execution ended");
		return new ResponseEntityDto(false, organizationStatusResponseDto);
	}

}
