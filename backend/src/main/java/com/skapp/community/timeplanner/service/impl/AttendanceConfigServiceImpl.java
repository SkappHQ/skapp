package com.skapp.community.timeplanner.service.impl;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.timeplanner.constant.TimeMessageConstant;
import com.skapp.community.timeplanner.model.AttendanceConfig;
import com.skapp.community.timeplanner.payload.request.AttendanceConfigRequestDto;
import com.skapp.community.timeplanner.repository.AttendanceConfigDao;
import com.skapp.community.timeplanner.service.AttendanceConfigService;
import com.skapp.community.timeplanner.type.AttendanceConfigType;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class AttendanceConfigServiceImpl implements AttendanceConfigService {

	public static final String DEFAULT_CONFIG_VALUE = "false";

	@NonNull
	private final AttendanceConfigDao attendanceConfigDao;

	@NonNull
	private final MessageUtil messageUtil;

	@NonNull
	private final UserService userService;

	@Override
	public void setDefaultAttendanceConfig() {
		log.info("setDefaultAttendanceConfig: execution started");

		Map<AttendanceConfigType, String> configMap = new EnumMap<>(AttendanceConfigType.class);
		configMap.put(AttendanceConfigType.CLOCK_IN_ON_NON_WORKING_DAYS, DEFAULT_CONFIG_VALUE);
		configMap.put(AttendanceConfigType.CLOCK_IN_ON_COMPANY_HOLIDAYS, DEFAULT_CONFIG_VALUE);
		configMap.put(AttendanceConfigType.CLOCK_IN_ON_LEAVE_DAYS, DEFAULT_CONFIG_VALUE);
		configMap.put(AttendanceConfigType.AUTO_APPROVAL_FOR_CHANGES, DEFAULT_CONFIG_VALUE);
		configMap.put(AttendanceConfigType.GEO_FENCING_ENABLED, DEFAULT_CONFIG_VALUE);

		configMap.forEach(this::updateOrCreateConfig);

		log.info("setDefaultAttendanceConfig: attendance configuration successfully created");
	}

	@Override
	@Transactional
	public ResponseEntityDto updateAttendanceConfig(AttendanceConfigRequestDto attendanceConfigRequestDto) {
		log.info("updateAttendanceConfig: execution started");

		Map<AttendanceConfigType, String> configMap = new EnumMap<>(AttendanceConfigType.class);
		configMap.put(AttendanceConfigType.CLOCK_IN_ON_NON_WORKING_DAYS,
				String.valueOf(attendanceConfigRequestDto.getIsClockInOnNonWorkingDays()));
		configMap.put(AttendanceConfigType.CLOCK_IN_ON_COMPANY_HOLIDAYS,
				String.valueOf(attendanceConfigRequestDto.getIsClockInOnCompanyHolidays()));
		configMap.put(AttendanceConfigType.CLOCK_IN_ON_LEAVE_DAYS,
				String.valueOf(attendanceConfigRequestDto.getIsClockInOnLeaveDays()));
		configMap.put(AttendanceConfigType.AUTO_APPROVAL_FOR_CHANGES,
				String.valueOf(attendanceConfigRequestDto.getIsAutoApprovalForChanges()));

		if (attendanceConfigRequestDto.getIsGeoFencingEnabled() != null) {
			configMap.put(AttendanceConfigType.GEO_FENCING_ENABLED,
					String.valueOf(attendanceConfigRequestDto.getIsGeoFencingEnabled()));
		}

		configMap.forEach(this::updateOrCreateConfig);

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
		List<AttendanceConfig> attendanceConfigs = attendanceConfigDao.findAll();

		if (userService.getCurrentUserRoles().contains(Role.ATTENDANCE_ADMIN.name())) {
			AttendanceConfigRequestDto dto = new AttendanceConfigRequestDto(false, false, false, false, false);

			for (AttendanceConfig config : attendanceConfigs) {
				boolean value = Boolean.parseBoolean(config.getAttendanceConfigValue());
				switch (config.getAttendanceConfigType()) {
					case CLOCK_IN_ON_NON_WORKING_DAYS -> dto.setIsClockInOnNonWorkingDays(value);
					case CLOCK_IN_ON_COMPANY_HOLIDAYS -> dto.setIsClockInOnCompanyHolidays(value);
					case CLOCK_IN_ON_LEAVE_DAYS -> dto.setIsClockInOnLeaveDays(value);
					case AUTO_APPROVAL_FOR_CHANGES -> dto.setIsAutoApprovalForChanges(value);
					case GEO_FENCING_ENABLED -> dto.setIsGeoFencingEnabled(value);
				}
			}

			return new ResponseEntityDto(false, dto);
		}

		boolean isGeoFencingEnabled = false;
		for (AttendanceConfig config : attendanceConfigs) {
			if (config.getAttendanceConfigType() == AttendanceConfigType.GEO_FENCING_ENABLED) {
				isGeoFencingEnabled = Boolean.parseBoolean(config.getAttendanceConfigValue());
				break;
			}
		}

		return new ResponseEntityDto(false,
				new AttendanceConfigRequestDto(null, null, null, null, isGeoFencingEnabled));
	}

	@Override
	public boolean getAttendanceConfigByType(AttendanceConfigType attendanceConfigType) {
		AttendanceConfig config = attendanceConfigDao.findByAttendanceConfigType(attendanceConfigType);
		if (config == null) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_ATTENDANCE_CONFIG_NOT_FOUND);
		}
		return Boolean.parseBoolean(config.getAttendanceConfigValue());
	}

}
