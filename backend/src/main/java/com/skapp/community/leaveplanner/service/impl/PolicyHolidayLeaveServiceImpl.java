package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.model.Organization;
import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.leaveplanner.constant.PolicyLeaveConstant;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestDao;
import com.skapp.community.leaveplanner.service.PolicyHolidayLeaveEmailService;
import com.skapp.community.leaveplanner.service.PolicyHolidayLeaveNotificationService;
import com.skapp.community.leaveplanner.service.PolicyHolidayLeaveService;
import com.skapp.community.leaveplanner.type.LeaveDuration;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.leaveplanner.util.LeaveModuleUtil;
import com.skapp.community.leaveplanner.util.PolicyHolidayLeaveUtil;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.type.HolidayDuration;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.function.Consumer;

@Service
@Slf4j
@RequiredArgsConstructor
public class PolicyHolidayLeaveServiceImpl implements PolicyHolidayLeaveService {

	private static final float HALF_DAY = 0.5f;

	private final PolicyLeaveRequestDao policyLeaveRequestDao;

	private final HolidayDao holidayDao;

	private final TimeConfigDao timeConfigDao;

	private final OrganizationDao organizationDao;

	private final PolicyHolidayLeaveEmailService policyHolidayLeaveEmailService;

	private final PolicyHolidayLeaveNotificationService policyHolidayLeaveNotificationService;

	@Override
	public void adjustLeaveRequestsForHoliday(Holiday holiday) {
		log.info("adjustLeaveRequestsForHoliday: execution started");

		LocalDate holidayDate = holiday.getDate();
		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		if (!timeConfigs.isEmpty() && !CommonModuleUtils.checkIfDayIsWorkingDay(holidayDate, timeConfigs)) {
			return;
		}

		List<Holiday> otherHolidaysOnDate = holidayDao.findAllByIsActiveTrueAndDate(holidayDate)
			.stream()
			.filter(existing -> !Objects.equals(existing.getId(), holiday.getId()))
			.toList();

		List<PolicyLeaveRequest> updatedRequests = new ArrayList<>();
		List<Consumer<String>> emails = new ArrayList<>();
		for (PolicyLeaveRequest request : policyLeaveRequestDao
			.findRequestsOnDate(PolicyLeaveConstant.ATTENDANCE_LEAVE_STATUSES, holidayDate)) {
			Employee employee = request.getEmployee();
			if (!appliesToEmployee(holiday, employee)) {
				continue;
			}

			Set<LeaveState> coveredBefore = getCoveredHalves(otherHolidaysOnDate, employee);
			Set<LeaveState> addedHalves = getHalves(holiday.getHolidayDuration());
			addedHalves.removeAll(coveredBefore);
			if (addedHalves.isEmpty()) {
				continue;
			}

			LeaveRequestStatus originalStatus = request.getStatus();
			Adjustment adjustment = adjustLeaveRequest(request, coveredBefore, addedHalves);
			if (adjustment == Adjustment.UNCHANGED) {
				continue;
			}
			boolean isVoided = adjustment == Adjustment.VOIDED;

			EmailBodyTemplates employeeTemplate = PolicyHolidayLeaveUtil.getEmployeeTemplate(isVoided, originalStatus);
			EmailBodyTemplates managerTemplate = PolicyHolidayLeaveUtil.getManagerTemplate(isVoided, originalStatus);
			policyHolidayLeaveNotificationService.sendHolidayLeaveRequestNotifications(request, holiday,
					employeeTemplate, managerTemplate);
			emails.add(organizationName -> policyHolidayLeaveEmailService.sendHolidayLeaveRequestEmails(request,
					holiday, employeeTemplate, managerTemplate, organizationName));
			updatedRequests.add(request);
		}

		if (!updatedRequests.isEmpty()) {
			policyLeaveRequestDao.saveAll(updatedRequests);
			runAfterCommit(emails);
		}

		log.info("adjustLeaveRequestsForHoliday: execution ended with {} request(s)", updatedRequests.size());
	}

	private Adjustment adjustLeaveRequest(PolicyLeaveRequest request, Set<LeaveState> coveredBefore,
			Set<LeaveState> addedHalves) {
		if (request.getStartDate().equals(request.getEndDate())) {
			if (LeaveModuleUtil.isHalfDay(request.getLeaveState())) {
				if (!addedHalves.contains(request.getLeaveState())) {
					return Adjustment.UNCHANGED;
				}
				voidLeaveRequest(request);
				return Adjustment.VOIDED;
			}

			Set<LeaveState> remainingHalves = EnumSet.of(LeaveState.HALFDAY_MORNING, LeaveState.HALFDAY_EVENING);
			remainingHalves.removeAll(coveredBefore);
			remainingHalves.removeAll(addedHalves);
			if (remainingHalves.isEmpty()) {
				voidLeaveRequest(request);
				return Adjustment.VOIDED;
			}

			if (request.getPolicy().getLeaveType().getMinDuration() != LeaveDuration.FULL_DAY) {
				request.setLeaveState(remainingHalves.iterator().next());
			}
			request.setDurationDays(HALF_DAY);
			return Adjustment.SHORTENED;
		}

		float revisedDuration = request.getDurationDays() - addedHalves.size() * HALF_DAY;
		if (revisedDuration <= 0f) {
			voidLeaveRequest(request);
			return Adjustment.VOIDED;
		}

		request.setDurationDays(revisedDuration);
		return Adjustment.SHORTENED;
	}

	private void voidLeaveRequest(PolicyLeaveRequest request) {
		request.setStatus(request.getStatus() == LeaveRequestStatus.PENDING ? LeaveRequestStatus.CANCELLED
				: LeaveRequestStatus.REVOKED);
	}

	// The halves of the date already off for this employee because of other holidays
	private Set<LeaveState> getCoveredHalves(List<Holiday> holidays, Employee employee) {
		Set<LeaveState> covered = EnumSet.noneOf(LeaveState.class);
		holidays.stream()
			.filter(holiday -> appliesToEmployee(holiday, employee))
			.forEach(holiday -> covered.addAll(getHalves(holiday.getHolidayDuration())));
		return covered;
	}

	private Set<LeaveState> getHalves(HolidayDuration holidayDuration) {
		return switch (holidayDuration) {
			case FULL_DAY -> EnumSet.of(LeaveState.HALFDAY_MORNING, LeaveState.HALFDAY_EVENING);
			case HALF_DAY_MORNING -> EnumSet.of(LeaveState.HALFDAY_MORNING);
			case HALF_DAY_EVENING -> EnumSet.of(LeaveState.HALFDAY_EVENING);
			case EXTENDED -> EnumSet.noneOf(LeaveState.class);
		};
	}

	// Same rule as the holidays an employee sees when applying: holidays with no work
	// location
	// apply to everyone, the others only to employees in one of their work locations
	private boolean appliesToEmployee(Holiday holiday, Employee employee) {
		Set<WorkLocation> workLocations = holiday.getWorkLocations();
		if (workLocations == null || workLocations.isEmpty()) {
			return true;
		}

		WorkLocation employeeWorkLocation = employee.getWorkLocation();
		if (employeeWorkLocation == null || employeeWorkLocation.getWorkLocationId() == null) {
			return false;
		}

		return workLocations.stream()
			.anyMatch(
					workLocation -> employeeWorkLocation.getWorkLocationId().equals(workLocation.getWorkLocationId()));
	}

	private String getOrganizationName() {
		return organizationDao.findTopByOrderByOrganizationIdDesc().map(Organization::getOrganizationName).orElse("");
	}

	// Emails can't be rolled back, so they go out only once the holiday and the leave
	// changes
	// are committed
	private void runAfterCommit(List<Consumer<String>> emails) {
		Runnable sendAll = () -> {
			String organizationName = getOrganizationName();
			emails.forEach(email -> {
				try {
					email.accept(organizationName);
				}
				catch (Exception e) {
					log.error("runAfterCommit: holiday leave email failed", e);
				}
			});
		};

		if (TransactionSynchronizationManager.isSynchronizationActive()) {
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					sendAll.run();
				}
			});
		}
		else {
			sendAll.run();
		}
	}

	private enum Adjustment {

		UNCHANGED, VOIDED, SHORTENED

	}

}
