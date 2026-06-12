package com.skapp.community.timeplanner.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.mapper.CommonMapper;
import com.skapp.community.common.model.User;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeTeamDao;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.timeplanner.constant.TimeMessageConstant;
import com.skapp.community.timeplanner.payload.request.AverageHoursWorkedTrendFilterDto;
import com.skapp.community.timeplanner.payload.request.ClockInClockOutTrendFilterDto;
import com.skapp.community.timeplanner.payload.request.ClockInSummaryFilterDto;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import com.skapp.community.timeplanner.repository.TimeRecordDao;
import com.skapp.community.timeplanner.service.AttendanceConfigService;
import com.skapp.community.timeplanner.service.TimeService;
import com.skapp.community.timeplanner.type.ClockInType;
import com.skapp.community.timeplanner.type.RecordType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TimeAnalyticsServiceImplUnitTest {

	@InjectMocks
	private TimeAnalyticsServiceImpl timeAnalyticsService;

	@Mock
	private TimeRecordDao timeRecordDao;

	@Mock
	private TimeConfigDao timeConfigDao;

	@Mock
	private TeamDao teamDao;

	@Mock
	private UserService userService;

	@Mock
	private LeaveRequestDao leaveRequestDao;

	@Mock
	private EmployeeTeamDao employeeTeamDao;

	@Mock
	private EmployeeDao employeeDao;

	@Mock
	private HolidayDao holidayDao;

	@Mock
	private LeaveMapper leaveMapper;

	@Mock
	private CommonMapper commonMapper;

	@Mock
	private PeopleMapper peopleMapper;

	@Mock
	private TimeService timeService;

	@Mock
	private AttendanceConfigService attendanceConfigService;

	@Mock
	private OrganizationService organizationService;

	@Mock
	private MessageUtil messageUtil;

	@BeforeEach
	void setupMessageUtil() throws Exception {
		when(messageUtil.getMessage(any(String.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(messageUtil.getMessage(any(String.class), any(Object[].class)))
			.thenAnswer(invocation -> invocation.getArgument(0));

		Field field = ModuleException.class.getDeclaredField("messageUtil");
		field.setAccessible(true);
		@SuppressWarnings("unchecked")
		AtomicReference<MessageUtil> atomicReference = (AtomicReference<MessageUtil>) field.get(null);
		atomicReference.set(messageUtil);
	}

	@Test
	void getClockInClockOutTrend_missingDate_throwsValidationError() {
		ClockInClockOutTrendFilterDto filterDto = new ClockInClockOutTrendFilterDto();
		filterDto.setRecordType(RecordType.CLOCK_IN);
		filterDto.setTimeOffset("+0530");

		ModuleException exception = assertThrows(ModuleException.class,
				() -> timeAnalyticsService.getClockInClockOutTrend(filterDto));

		assertEquals(TimeMessageConstant.TIME_ERROR_DATE_REQUIRED, exception.getMessageKey());
	}

	@Test
	void getClockInClockOutTrend_missingRecordType_throwsValidationError() {
		ClockInClockOutTrendFilterDto filterDto = new ClockInClockOutTrendFilterDto();
		filterDto.setDate(LocalDate.now());
		filterDto.setTimeOffset("+0530");

		ModuleException exception = assertThrows(ModuleException.class,
				() -> timeAnalyticsService.getClockInClockOutTrend(filterDto));

		assertEquals(TimeMessageConstant.TIME_ERROR_RECORD_TYPE_REQUIRED, exception.getMessageKey());
	}

	@Test
	void getClockInClockOutTrend_missingTimeOffset_throwsValidationError() {
		ClockInClockOutTrendFilterDto filterDto = new ClockInClockOutTrendFilterDto();
		filterDto.setDate(LocalDate.now());
		filterDto.setRecordType(RecordType.CLOCK_IN);

		ModuleException exception = assertThrows(ModuleException.class,
				() -> timeAnalyticsService.getClockInClockOutTrend(filterDto));

		assertEquals(TimeMessageConstant.TIME_ERROR_TIME_OFFSET_REQUIRED, exception.getMessageKey());
	}

	@Test
	void averageHoursWorkedTrend_missingMonth_throwsValidationError() {
		AverageHoursWorkedTrendFilterDto filterDto = new AverageHoursWorkedTrendFilterDto();
		filterDto.setTeams(List.of(1L));

		ModuleException exception = assertThrows(ModuleException.class,
				() -> timeAnalyticsService.averageHoursWorkedTrend(filterDto));

		assertEquals(TimeMessageConstant.TIME_ERROR_MONTH_REQUIRED, exception.getMessageKey());
	}

	@Test
	void averageEmployeeHoursWorkedTrend_missingMonth_throwsValidationError() {
		AverageHoursWorkedTrendFilterDto filterDto = new AverageHoursWorkedTrendFilterDto();

		ModuleException exception = assertThrows(ModuleException.class,
				() -> timeAnalyticsService.averageEmployeeHoursWorkedTrend(filterDto, 1L));

		assertEquals(TimeMessageConstant.TIME_ERROR_MONTH_REQUIRED, exception.getMessageKey());
	}

	@Test
	void clockInSummary_missingDate_throwsValidationError() {
		ClockInSummaryFilterDto filterDto = new ClockInSummaryFilterDto();
		filterDto.setClockInType(List.of(ClockInType.ALL_CLOCK_INS));

		ModuleException exception = assertThrows(ModuleException.class,
				() -> timeAnalyticsService.clockInSummary(filterDto));

		assertEquals(TimeMessageConstant.TIME_ERROR_DATE_REQUIRED, exception.getMessageKey());
	}

	@Test
	void getIndividualWorkUtilization_withoutManagerPermission_throwsValidationError() {
		User currentUser = new User();
		currentUser.setUserId(1L);
		currentUser.setEmployee(new Employee());
		currentUser.getEmployee().setEmployeeRole(new EmployeeRole());
		currentUser.getEmployee().getEmployeeRole().setAttendanceRole(Role.ATTENDANCE_EMPLOYEE);
		when(userService.getCurrentUser()).thenReturn(currentUser);

		ModuleException exception = assertThrows(ModuleException.class,
				() -> timeAnalyticsService.getIndividualWorkUtilization(1L));

		assertEquals(TimeMessageConstant.TIME_ERROR_MANAGER_OR_ABOVE_PERMISSIONS_REQUIRED, exception.getMessageKey());
	}

	@Test
	void getIndividualWorkUtilization_whenEmployeeNotFound_throwsValidationError() {
		User currentUser = new User();
		currentUser.setUserId(1L);
		currentUser.setEmployee(new Employee());
		currentUser.getEmployee().setEmployeeRole(new EmployeeRole());
		currentUser.getEmployee().getEmployeeRole().setAttendanceRole(Role.ATTENDANCE_MANAGER);
		when(userService.getCurrentUser()).thenReturn(currentUser);
		when(employeeDao.findById(99L)).thenReturn(Optional.empty());

		ModuleException exception = assertThrows(ModuleException.class,
				() -> timeAnalyticsService.getIndividualWorkUtilization(99L));

		assertEquals(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND, exception.getMessageKey());
	}

}
