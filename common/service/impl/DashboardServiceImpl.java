package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.timeplanner.repository.TimeRequestDao;
import com.skapp.enterprise.common.model.EpOrganization;
import com.skapp.enterprise.common.payload.DashboardEmailOrganizationDetailsDto;
import com.skapp.enterprise.common.payload.response.DashboardNotificationCountDto;
import com.skapp.enterprise.common.repository.EpOrganizationDao;
import com.skapp.enterprise.common.service.DashboardService;
import com.skapp.enterprise.common.util.EpDateTimeUtils;
import com.skapp.enterprise.common.util.RoleUtil;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.RecipientDao;
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

	private final UserService userService;

	private final LeaveRequestDao leaveRequestDao;

	private final TimeRequestDao timeRequestDao;

	private final RecipientDao recipientDao;

	private final AddressBookDao addressBookDao;

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

	@Override
	public DashboardNotificationCountDto getDashboardNotificationCounts() {
		User currentUser = userService.getCurrentUser();
		Employee employee = currentUser.getEmployee();
		Long employeeId = employee.getEmployeeId();

		DashboardNotificationCountDto notificationCounts = new DashboardNotificationCountDto();

		Role leaveRole = employee.getEmployeeRole().getLeaveRole();
		Role attendanceRole = employee.getEmployeeRole().getAttendanceRole();
		Role esignRole = employee.getEmployeeRole().getEsignRole();

		if (RoleUtil.isLeaveManagerOrAdmin(leaveRole)) {
			notificationCounts
				.setPendingLeaveRequestsCount(leaveRequestDao.countSupervisedPendingLeaveRequests(employeeId));
		}

		if (RoleUtil.isAttendanceManagerOrAdmin(attendanceRole)) {
			notificationCounts
				.setPendingTimeEntryRequestsCount(timeRequestDao.countSupervisedPendingTimeRequests(employeeId));
		}

		if (RoleUtil.isEsignSenderAdminOrSuperAdmin(esignRole)) {
			notificationCounts.setPendingDocumentsToSignCount(recipientDao.countPendingDocumentsForSendersAndAdmins());
		}
		else if (esignRole == Role.ESIGN_EMPLOYEE) {
			Long pendingDocumentsCount = addressBookDao.findByInternalUserUserId(currentUser.getUserId())
				.map(addressBook -> recipientDao.countPendingDocumentsForUser(addressBook.getId()))
				.orElse(0L);
			notificationCounts.setPendingDocumentsToSignCount(pendingDocumentsCount);
		}

		log.info("Dashboard notification counts for user {}: Leave={}, TimeEntry={}, Documents={}", employeeId,
				notificationCounts.getPendingLeaveRequestsCount(),
				notificationCounts.getPendingTimeEntryRequestsCount(),
				notificationCounts.getPendingDocumentsToSignCount());

		return notificationCounts;
	}

}
