package com.skapp.community.timeplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.timeplanner.constant.TimeMessageConstant;
import com.skapp.community.timeplanner.model.AttendanceConfig;
import com.skapp.community.timeplanner.payload.request.AttendanceConfigRequestDto;
import com.skapp.community.timeplanner.repository.AttendanceConfigDao;
import com.skapp.community.timeplanner.type.AttendanceConfigType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.skapp.community.common.service.UserService;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AttendanceConfigServiceImplUnitTest {

	@InjectMocks
	private AttendanceConfigServiceImpl attendanceConfigService;

	@Mock
	private AttendanceConfigDao attendanceConfigDao;

	@Mock
	private MessageUtil messageUtil;

	@Mock
	private UserService userService;

	@BeforeEach
	void setupMessageUtil() throws Exception {
		when(messageUtil.getMessage(any(String.class))).thenAnswer(invocation -> invocation.getArgument(0));

		Field field = ModuleException.class.getDeclaredField("messageUtil");
		field.setAccessible(true);
		@SuppressWarnings("unchecked")
		AtomicReference<MessageUtil> atomicReference = (AtomicReference<MessageUtil>) field.get(null);
		atomicReference.set(messageUtil);
	}

	@Test
	void getAttendanceConfigByType_whenMissing_throwsValidationError() {
		when(attendanceConfigDao.findByAttendanceConfigType(AttendanceConfigType.CLOCK_IN_ON_NON_WORKING_DAYS))
			.thenReturn(null);

		ModuleException exception = assertThrows(ModuleException.class, () -> attendanceConfigService
			.getAttendanceConfigByType(AttendanceConfigType.CLOCK_IN_ON_NON_WORKING_DAYS));

		assertEquals(TimeMessageConstant.TIME_ERROR_ATTENDANCE_CONFIG_NOT_FOUND, exception.getMessageKey());
	}

	@Test
	void setDefaultAttendanceConfig_savesAllDefaultConfigs() {
		when(attendanceConfigDao.findByAttendanceConfigType(any())).thenReturn(null);

		attendanceConfigService.setDefaultAttendanceConfig();

		verify(attendanceConfigDao, times(AttendanceConfigType.values().length)).save(any(AttendanceConfig.class));
	}

	@Test
	void updateAttendanceConfig_whenGeoFencingNull_skipsGeoConfigUpdate() {
		AttendanceConfigRequestDto request = new AttendanceConfigRequestDto(true, false, true, false, null);

		when(attendanceConfigDao.findByAttendanceConfigType(any())).thenReturn(null);

		attendanceConfigService.updateAttendanceConfig(request);

		verify(attendanceConfigDao, times(4)).save(any(AttendanceConfig.class));
	}

	@Test
	void getAllAttendanceConfigs_adminReturnsFullDto() {
		when(userService.getCurrentUserRoles()).thenReturn(Set.of(Role.ATTENDANCE_ADMIN.name()));
		when(attendanceConfigDao.findAll())
			.thenReturn(List.of(new AttendanceConfig(AttendanceConfigType.CLOCK_IN_ON_NON_WORKING_DAYS, "true"),
					new AttendanceConfig(AttendanceConfigType.GEO_FENCING_ENABLED, "false")));

		assertNotNull(attendanceConfigService.getAllAttendanceConfigs().getResults().getFirst());
	}

	@Test
	void updateAttendanceConfig_whenGeoFencingProvided_savesAllFiveConfigs() {
		AttendanceConfigRequestDto request = new AttendanceConfigRequestDto(true, false, true, false, true);
		when(attendanceConfigDao.findByAttendanceConfigType(any())).thenReturn(null);

		attendanceConfigService.updateAttendanceConfig(request);

		verify(attendanceConfigDao, times(5)).save(any(AttendanceConfig.class));
	}

	@Test
	void getAllAttendanceConfigs_nonAdminReturnsGeoFencingOnly() {
		when(userService.getCurrentUserRoles()).thenReturn(Set.of(Role.ATTENDANCE_EMPLOYEE.name()));
		when(attendanceConfigDao.findAll())
			.thenReturn(List.of(new AttendanceConfig(AttendanceConfigType.GEO_FENCING_ENABLED, "true")));

		AttendanceConfigRequestDto dto = (AttendanceConfigRequestDto) attendanceConfigService.getAllAttendanceConfigs()
			.getResults()
			.getFirst();

		assertNull(dto.getIsClockInOnNonWorkingDays());
		assertTrue(dto.getIsGeoFencingEnabled());
	}

	@Test
	void getAttendanceConfigByType_whenExists_returnsBoolean() {
		when(attendanceConfigDao.findByAttendanceConfigType(AttendanceConfigType.CLOCK_IN_ON_LEAVE_DAYS))
			.thenReturn(new AttendanceConfig(AttendanceConfigType.CLOCK_IN_ON_LEAVE_DAYS, "true"));

		assertTrue(attendanceConfigService.getAttendanceConfigByType(AttendanceConfigType.CLOCK_IN_ON_LEAVE_DAYS));
	}

}
