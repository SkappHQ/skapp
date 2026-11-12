package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestDao;
import com.skapp.community.leaveplanner.service.impl.PolicyHolidayLeaveServiceImpl;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.type.HolidayDuration;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PolicyHolidayLeaveServiceImplUnitTest {

	private static final LocalDate MONDAY = LocalDate.of(2030, 1, 7);

	private static final LocalDate SATURDAY = LocalDate.of(2030, 1, 12);

	@Mock
	private PolicyLeaveRequestDao policyLeaveRequestDao;

	@Mock
	private HolidayDao holidayDao;

	@Mock
	private TimeConfigDao timeConfigDao;

	@Mock
	private PolicyHolidayLeaveEmailService emailService;

	@Mock
	private PolicyHolidayLeaveNotificationService notificationService;

	private PolicyHolidayLeaveServiceImpl service;

	@BeforeEach
	void setup() {
		service = new PolicyHolidayLeaveServiceImpl(policyLeaveRequestDao, holidayDao, timeConfigDao, emailService,
				notificationService);
		when(timeConfigDao.findAll()).thenReturn(weekdayTimeConfigs());
		when(holidayDao.findAllByIsActiveTrueAndDate(any())).thenReturn(new ArrayList<>());
	}

	@Test
	void fullDayHoliday_cancelsPendingSingleDayLeave() {
		Holiday holiday = holiday(1L, MONDAY, HolidayDuration.FULL_DAY);
		PolicyLeaveRequest request = request(MONDAY, MONDAY, LeaveState.FULLDAY, 1f, LeaveRequestStatus.PENDING, null);
		stubRequests(request);

		service.adjustLeaveRequestsForHoliday(holiday);

		assertEquals(LeaveRequestStatus.CANCELLED, request.getStatus());
		verify(emailService).sendHolidayLeaveRequestVoidedEmails(request, holiday, LeaveRequestStatus.PENDING);
		verify(notificationService).sendHolidayLeaveRequestVoidedNotifications(request, holiday,
				LeaveRequestStatus.PENDING);
		verify(policyLeaveRequestDao).saveAll(List.of(request));
	}

	@Test
	void fullDayHoliday_revokesApprovedHalfDayLeave() {
		Holiday holiday = holiday(1L, MONDAY, HolidayDuration.FULL_DAY);
		PolicyLeaveRequest request = request(MONDAY, MONDAY, LeaveState.HALFDAY_MORNING, 0.5f,
				LeaveRequestStatus.APPROVED, null);
		stubRequests(request);

		service.adjustLeaveRequestsForHoliday(holiday);

		assertEquals(LeaveRequestStatus.REVOKED, request.getStatus());
		verify(emailService).sendHolidayLeaveRequestVoidedEmails(request, holiday, LeaveRequestStatus.APPROVED);
	}

	@Test
	void fullDayHoliday_shortensMultiDayLeaveByOneDay() {
		Holiday holiday = holiday(1L, MONDAY.plusDays(1), HolidayDuration.FULL_DAY);
		PolicyLeaveRequest request = request(MONDAY, MONDAY.plusDays(2), LeaveState.FULLDAY, 3f,
				LeaveRequestStatus.APPROVED, null);
		stubRequests(request);

		service.adjustLeaveRequestsForHoliday(holiday);

		assertEquals(LeaveRequestStatus.APPROVED, request.getStatus());
		assertEquals(2f, request.getDurationDays());
		verify(emailService).sendHolidayLeaveRequestUpdatedEmails(request, holiday);
		verify(notificationService).sendHolidayLeaveRequestUpdatedNotifications(request, holiday);
	}

	@Test
	void halfDayHoliday_shortensMultiDayLeaveByHalfDay() {
		Holiday holiday = holiday(1L, MONDAY, HolidayDuration.HALF_DAY_EVENING);
		PolicyLeaveRequest request = request(MONDAY, MONDAY.plusDays(1), LeaveState.FULLDAY, 2f,
				LeaveRequestStatus.PENDING, null);
		stubRequests(request);

		service.adjustLeaveRequestsForHoliday(holiday);

		assertEquals(LeaveRequestStatus.PENDING, request.getStatus());
		assertEquals(1.5f, request.getDurationDays());
	}

	@Test
	void halfDayMorningHoliday_turnsSingleFullDayLeaveIntoEveningHalfDay() {
		Holiday holiday = holiday(1L, MONDAY, HolidayDuration.HALF_DAY_MORNING);
		PolicyLeaveRequest request = request(MONDAY, MONDAY, LeaveState.FULLDAY, 1f, LeaveRequestStatus.APPROVED, null);
		stubRequests(request);

		service.adjustLeaveRequestsForHoliday(holiday);

		assertEquals(LeaveRequestStatus.APPROVED, request.getStatus());
		assertEquals(LeaveState.HALFDAY_EVENING, request.getLeaveState());
		assertEquals(0.5f, request.getDurationDays());
		verify(emailService).sendHolidayLeaveRequestUpdatedEmails(request, holiday);
	}

	@Test
	void halfDayHoliday_cancelsSameHalfLeave_andKeepsOtherHalfLeave() {
		Holiday holiday = holiday(1L, MONDAY, HolidayDuration.HALF_DAY_MORNING);
		PolicyLeaveRequest sameHalf = request(MONDAY, MONDAY, LeaveState.HALFDAY_MORNING, 0.5f,
				LeaveRequestStatus.PENDING, null);
		PolicyLeaveRequest otherHalf = request(MONDAY, MONDAY, LeaveState.HALFDAY_EVENING, 0.5f,
				LeaveRequestStatus.PENDING, null);
		stubRequests(sameHalf, otherHalf);

		service.adjustLeaveRequestsForHoliday(holiday);

		assertEquals(LeaveRequestStatus.CANCELLED, sameHalf.getStatus());
		assertEquals(LeaveRequestStatus.PENDING, otherHalf.getStatus());
		assertEquals(0.5f, otherHalf.getDurationDays());
		verify(policyLeaveRequestDao).saveAll(List.of(sameHalf));
	}

	@Test
	void holidayForOtherWorkLocation_leavesRequestUnchanged() {
		Holiday holiday = holiday(1L, MONDAY, HolidayDuration.FULL_DAY);
		holiday.setWorkLocations(new HashSet<>(Set.of(workLocation(2L))));
		PolicyLeaveRequest request = request(MONDAY, MONDAY, LeaveState.FULLDAY, 1f, LeaveRequestStatus.PENDING,
				workLocation(1L));
		PolicyLeaveRequest noLocation = request(MONDAY, MONDAY, LeaveState.FULLDAY, 1f, LeaveRequestStatus.PENDING,
				null);
		stubRequests(request, noLocation);

		service.adjustLeaveRequestsForHoliday(holiday);

		assertEquals(LeaveRequestStatus.PENDING, request.getStatus());
		assertEquals(LeaveRequestStatus.PENDING, noLocation.getStatus());
		verify(policyLeaveRequestDao, never()).saveAll(any());
		verifyNoInteractions(emailService, notificationService);
	}

	@Test
	void holidayForEmployeeWorkLocation_updatesRequest() {
		Holiday holiday = holiday(1L, MONDAY, HolidayDuration.FULL_DAY);
		holiday.setWorkLocations(new HashSet<>(Set.of(workLocation(1L))));
		PolicyLeaveRequest request = request(MONDAY, MONDAY, LeaveState.FULLDAY, 1f, LeaveRequestStatus.PENDING,
				workLocation(1L));
		stubRequests(request);

		service.adjustLeaveRequestsForHoliday(holiday);

		assertEquals(LeaveRequestStatus.CANCELLED, request.getStatus());
	}

	@Test
	void requestStartingAfterHoliday_isIgnored() {
		Holiday holiday = holiday(1L, MONDAY, HolidayDuration.FULL_DAY);
		PolicyLeaveRequest request = request(MONDAY.plusDays(1), MONDAY.plusDays(1), LeaveState.FULLDAY, 1f,
				LeaveRequestStatus.PENDING, null);
		stubRequests(request);

		service.adjustLeaveRequestsForHoliday(holiday);

		assertEquals(LeaveRequestStatus.PENDING, request.getStatus());
		verifyNoInteractions(emailService, notificationService);
	}

	@Test
	void dateAlreadyCoveredByFullDayHoliday_leavesRequestUnchanged() {
		Holiday holiday = holiday(2L, MONDAY, HolidayDuration.HALF_DAY_MORNING);
		when(holidayDao.findAllByIsActiveTrueAndDate(MONDAY))
			.thenReturn(List.of(holiday(1L, MONDAY, HolidayDuration.FULL_DAY), holiday));
		PolicyLeaveRequest request = request(MONDAY, MONDAY.plusDays(1), LeaveState.FULLDAY, 1f,
				LeaveRequestStatus.APPROVED, null);
		stubRequests(request);

		service.adjustLeaveRequestsForHoliday(holiday);

		assertEquals(1f, request.getDurationDays());
		verifyNoInteractions(emailService, notificationService);
	}

	@Test
	void holidayOnNonWorkingDay_doesNothing() {
		service.adjustLeaveRequestsForHoliday(holiday(1L, SATURDAY, HolidayDuration.FULL_DAY));

		verify(policyLeaveRequestDao, never()).findUpcomingRequests(anyCollection(), eq(SATURDAY));
		verifyNoInteractions(emailService, notificationService);
	}

	private void stubRequests(PolicyLeaveRequest... requests) {
		when(policyLeaveRequestDao.findUpcomingRequests(anyCollection(), any())).thenReturn(List.of(requests));
	}

	private static List<TimeConfig> weekdayTimeConfigs() {
		List<TimeConfig> configs = new ArrayList<>();
		for (DayOfWeek day : List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
				DayOfWeek.FRIDAY)) {
			TimeConfig config = new TimeConfig();
			config.setDay(day);
			configs.add(config);
		}
		return configs;
	}

	private static Holiday holiday(Long id, LocalDate date, HolidayDuration duration) {
		Holiday holiday = new Holiday();
		holiday.setId(id);
		holiday.setDate(date);
		holiday.setName("Holiday " + id);
		holiday.setHolidayDuration(duration);
		return holiday;
	}

	private static WorkLocation workLocation(Long id) {
		WorkLocation workLocation = new WorkLocation();
		workLocation.setWorkLocationId(id);
		return workLocation;
	}

	private static PolicyLeaveRequest request(LocalDate startDate, LocalDate endDate, LeaveState leaveState,
			float durationDays, LeaveRequestStatus status, WorkLocation workLocation) {
		Employee employee = new Employee();
		employee.setWorkLocation(workLocation);

		PolicyLeaveRequest request = new PolicyLeaveRequest();
		request.setEmployee(employee);
		request.setStartDate(startDate);
		request.setEndDate(endDate);
		request.setLeaveState(leaveState);
		request.setDurationDays(durationDays);
		request.setStatus(status);
		return request;
	}

}
