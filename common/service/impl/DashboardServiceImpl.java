package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.model.Organization;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.payload.DashboardEmailOrganizationDetailsDto;
import com.skapp.enterprise.common.service.DashboardService;
import com.skapp.enterprise.common.util.EpDateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

	private final OrganizationDao organizationDao;

	private final EmployeeDao employeeDao;

	@Override
	public DashboardEmailOrganizationDetailsDto getDashboardEmailOrganizationDetails(String superAdminEmail) {
		Optional<Organization> optionalOrganization = organizationDao.findTopByOrderByOrganizationIdDesc();
		String companyName = optionalOrganization.map(Organization::getOrganizationName).orElse(null);

		String formattedCurrentTime = EpDateTimeUtils.DATE_TIME_FORMATTER.format(ZonedDateTime.now());

		long userCount = employeeDao.countByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));

		String contactNumber = "";

		DashboardEmailOrganizationDetailsDto dashboardEmailOrganizationDetailsDto = new DashboardEmailOrganizationDetailsDto();
		dashboardEmailOrganizationDetailsDto.setCompanyName(companyName);
		dashboardEmailOrganizationDetailsDto.setCurrentTime(formattedCurrentTime);
		dashboardEmailOrganizationDetailsDto.setUserCount(userCount);
		dashboardEmailOrganizationDetailsDto.setSuperAdminEmail(superAdminEmail);
		dashboardEmailOrganizationDetailsDto.setContactNo(contactNumber);

		return dashboardEmailOrganizationDetailsDto;
	}

}
