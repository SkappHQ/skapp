package com.skapp.community.timeplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.AuthUtil;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.timeplanner.constant.TimeConstants;
import com.skapp.community.timeplanner.constant.TimeMessageConstant;
import com.skapp.community.timeplanner.model.AttendanceConfig;
import com.skapp.community.timeplanner.payload.request.AttendanceConfigRequestDto;
import com.skapp.community.timeplanner.repository.AttendanceConfigDao;
import com.skapp.community.timeplanner.service.AttendanceConfigService;
import com.skapp.community.timeplanner.type.AttendanceConfigType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AttendanceConfigServiceImpl implements AttendanceConfigService {

	private final AttendanceConfigDao attendanceConfigDao;

	private final MessageUtil messageUtil;

	private final UserService userService;

	@Override
	public void setDefaultAttendanceConfig() {
		log.info("setDefaultAttendanceConfig: execution started");

		for (AttendanceConfigType configType : AttendanceConfigType.values()) {
			updateOrCreateConfig(configType, TimeConstants.DEFAULT_CONFIG_VALUE);
		}

		log.info("setDefaultAttendanceConfig: execution ended");
	}

	@Override
	@Transactional
	public ResponseEntityDto updateAttendanceConfig(AttendanceConfigRequestDto attendanceConfigRequestDto) {
		log.info("updateAttendanceConfig: execution started");

		updateOrCreateConfig(AttendanceConfigType.CLOCK_IN_ON_NON_WORKING_DAYS,
				String.valueOf(attendanceConfigRequestDto.getIsClockInOnNonWorkingDays()));
		updateOrCreateConfig(AttendanceConfigType.CLOCK_IN_ON_COMPANY_HOLIDAYS,
				String.valueOf(attendanceConfigRequestDto.getIsClockInOnCompanyHolidays()));
		updateOrCreateConfig(AttendanceConfigType.CLOCK_IN_ON_LEAVE_DAYS,
				String.valueOf(attendanceConfigRequestDto.getIsClockInOnLeaveDays()));
		updateOrCreateConfig(AttendanceConfigType.AUTO_APPROVAL_FOR_CHANGES,
				String.valueOf(attendanceConfigRequestDto.getIsAutoApprovalForChanges()));

		if (attendanceConfigRequestDto.getIsGeoFencingEnabled() != null) {
			updateOrCreateConfig(AttendanceConfigType.GEO_FENCING_ENABLED,
					String.valueOf(attendanceConfigRequestDto.getIsGeoFencingEnabled()));
		}

		if (attendanceConfigRequestDto.getIsClockInClockOutOnly() != null) {
			updateOrCreateConfig(AttendanceConfigType.CLOCK_IN_OUT_ONLY,
					String.valueOf(attendanceConfigRequestDto.getIsClockInClockOutOnly()));
		}

		if (attendanceConfigRequestDto.getIsFingerprintAttendanceEnabled() != null) {
			updateOrCreateConfig(AttendanceConfigType.FINGERPRINT_ATTENDANCE_ENABLED,
					String.valueOf(attendanceConfigRequestDto.getIsFingerprintAttendanceEnabled()));
		}

		if (attendanceConfigRequestDto.getIsManualEntryRestrictionEnabled() != null) {
			updateOrCreateConfig(AttendanceConfigType.MANUAL_ENTRY_RESTRICTION_ENABLED,
					String.valueOf(attendanceConfigRequestDto.getIsManualEntryRestrictionEnabled()));
		}

		log.info("updateAttendanceConfig: execution ended");
		return new ResponseEntityDto(messageUtil.getMessage(TimeMessageConstant.TIME_SUCCESS_ATTENDANCE_CONFIG_UPDATED),
				false);
	}

	private void updateOrCreateConfig(AttendanceConfigType configType, String configValue) {
		AttendanceConfig config = attendanceConfigDao.findByAttendanceConfigType(configType);

		if (config == null) {
			config = new AttendanceConfig(configType, configValue);
		}
		else {
			config.setAttendanceConfigValue(configValue);
		}

		attendanceConfigDao.save(config);
	}

	@Override
	public ResponseEntityDto getAllAttendanceConfigs() {
		log.info("getAllAttendanceConfigs: execution started");
		List<AttendanceConfig> attendanceConfigs = attendanceConfigDao.findAll();

		if (userService.getCurrentUserRoles().contains(AuthUtil.withRolePrefix(Role.ATTENDANCE_ADMIN))) {

			AttendanceConfigRequestDto dto = getAttendanceConfigRequestDto(attendanceConfigs);

			log.info("getAllAttendanceConfigs: execution ended");
			return new ResponseEntityDto(false, dto);
		}

		boolean isGeoFencingEnabled = isConfigEnabled(attendanceConfigs, AttendanceConfigType.GEO_FENCING_ENABLED);
		boolean isClockInClockOutOnly = isConfigEnabled(attendanceConfigs, AttendanceConfigType.CLOCK_IN_OUT_ONLY);
		boolean isManualEntryRestrictionEnabled = isConfigEnabled(attendanceConfigs,
				AttendanceConfigType.MANUAL_ENTRY_RESTRICTION_ENABLED);

		AttendanceConfigRequestDto attendanceConfigRequestDto = new AttendanceConfigRequestDto(null, null, null, null,
				isGeoFencingEnabled, isClockInClockOutOnly, null, isManualEntryRestrictionEnabled);

		log.info("getAllAttendanceConfigs: execution ended");

		return new ResponseEntityDto(false, attendanceConfigRequestDto);
	}

	private static AttendanceConfigRequestDto getAttendanceConfigRequestDto(List<AttendanceConfig> attendanceConfigs) {
		AttendanceConfigRequestDto dto = new AttendanceConfigRequestDto(false, false, false, false, false, false, false,
				false);

		for (AttendanceConfig config : attendanceConfigs) {
			boolean value = Boolean.parseBoolean(config.getAttendanceConfigValue());
			switch (config.getAttendanceConfigType()) {
				case CLOCK_IN_ON_NON_WORKING_DAYS -> dto.setIsClockInOnNonWorkingDays(value);
				case CLOCK_IN_ON_COMPANY_HOLIDAYS -> dto.setIsClockInOnCompanyHolidays(value);
				case CLOCK_IN_ON_LEAVE_DAYS -> dto.setIsClockInOnLeaveDays(value);
				case AUTO_APPROVAL_FOR_CHANGES -> dto.setIsAutoApprovalForChanges(value);
				case GEO_FENCING_ENABLED -> dto.setIsGeoFencingEnabled(value);
				case CLOCK_IN_OUT_ONLY -> dto.setIsClockInClockOutOnly(value);
				case FINGERPRINT_ATTENDANCE_ENABLED -> dto.setIsFingerprintAttendanceEnabled(value);
				case MANUAL_ENTRY_RESTRICTION_ENABLED -> dto.setIsManualEntryRestrictionEnabled(value);
			}
		}

		return dto;
	}

	@Override
	public boolean getAttendanceConfigByType(AttendanceConfigType attendanceConfigType) {
		AttendanceConfig config = attendanceConfigDao.findByAttendanceConfigType(attendanceConfigType);
		if (config == null) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_ATTENDANCE_CONFIG_NOT_FOUND);
		}
		return Boolean.parseBoolean(config.getAttendanceConfigValue());
	}

	@Override
	public boolean isAttendanceConfigEnabled(AttendanceConfigType attendanceConfigType) {
		AttendanceConfig config = attendanceConfigDao.findByAttendanceConfigType(attendanceConfigType);
		return config != null && Boolean.parseBoolean(config.getAttendanceConfigValue());
	}

	private static boolean isConfigEnabled(List<AttendanceConfig> attendanceConfigs,
			AttendanceConfigType attendanceConfigType) {
		return attendanceConfigs.stream()
			.filter(c -> c.getAttendanceConfigType() == attendanceConfigType)
			.findFirst()
			.map(c -> Boolean.parseBoolean(c.getAttendanceConfigValue()))
			.orElse(false);
	}

}
