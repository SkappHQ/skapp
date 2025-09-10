package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.UserDao;
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
import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

	private final EpOrganizationDao epOrganizationDao;

	private final EmployeeDao employeeDao;

	private final UserDao userDao;

	@Override
	public DashboardEmailOrganizationDetailsDto getDashboardEmailOrganizationDetails(String superAdminEmail) {
		EpOrganization organization = epOrganizationDao.findTopByOrderByOrganizationIdDesc();
		String companyName = organization.getOrganizationName();
		String contactNumber = organization.getContactNo();
		String formattedCurrentTime = EpDateTimeUtils.DATE_TIME_FORMATTER.format(ZonedDateTime.now());

		long userCount = employeeDao.countByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));

		Optional<User> superAdmin = userDao.findByEmail(superAdminEmail);

		String superAdminName = "";
		if (superAdmin.isPresent()) {
			superAdminName = superAdmin.get().getEmployee().getFullName();

		}

		DashboardEmailOrganizationDetailsDto dashboardEmailOrganizationDetailsDto = new DashboardEmailOrganizationDetailsDto();
		dashboardEmailOrganizationDetailsDto.setCompanyName(companyName);
		dashboardEmailOrganizationDetailsDto.setCurrentTime(formattedCurrentTime);
		dashboardEmailOrganizationDetailsDto.setUserCount(userCount);
		dashboardEmailOrganizationDetailsDto.setSuperAdminEmail(superAdminEmail);
		dashboardEmailOrganizationDetailsDto.setSuperAdminName(superAdminName);
		dashboardEmailOrganizationDetailsDto.setContactNo(contactNumber);

		return dashboardEmailOrganizationDetailsDto;
	}

}
