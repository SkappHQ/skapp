package com.skapp.enterprise.common.service.impl;

import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.model.EpOrganization;
import com.skapp.enterprise.common.payload.DashboardEmailOrganizationDetailsDto;
import com.skapp.enterprise.common.repository.EpOrganizationDao;
import com.skapp.enterprise.common.service.DashboardService;
import com.skapp.enterprise.common.util.EpDateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

	private final EpOrganizationDao epOrganizationDao;

	private final EmployeeDao employeeDao;

	@Override
	public DashboardEmailOrganizationDetailsDto getDashboardEmailOrganizationDetails(String superAdminEmail) {
		EpOrganization organization = epOrganizationDao.findTopByOrderByOrganizationIdDesc();
		String companyName = organization.getOrganizationName();
		String contactNumber = organization.getContactNo();
		String formattedCurrentTime = EpDateTimeUtils.DATE_TIME_FORMATTER.format(ZonedDateTime.now());

		long userCount = employeeDao.countByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));

		DashboardEmailOrganizationDetailsDto dashboardEmailOrganizationDetailsDto = new DashboardEmailOrganizationDetailsDto();
		dashboardEmailOrganizationDetailsDto.setCompanyName(companyName);
		dashboardEmailOrganizationDetailsDto.setCurrentTime(formattedCurrentTime);
		dashboardEmailOrganizationDetailsDto.setUserCount(userCount);
		dashboardEmailOrganizationDetailsDto.setSuperAdminEmail(superAdminEmail);
		dashboardEmailOrganizationDetailsDto.setContactNo(contactNumber);

		return dashboardEmailOrganizationDetailsDto;
	}

}
