package com.skapp.community.timeplanner.service.impl;

import com.skapp.community.timeplanner.config.AttendanceModeProperties;
import com.skapp.community.timeplanner.model.AttendanceConfig;
import com.skapp.community.timeplanner.repository.AttendanceConfigDao;
import com.skapp.community.timeplanner.service.AttendanceModeService;
import com.skapp.community.timeplanner.type.AttendanceConfigType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AttendanceModeServiceImpl implements AttendanceModeService {

	protected final AttendanceModeProperties attendanceModeProperties;

	protected final AttendanceConfigDao attendanceConfigDao;

	@Override
	public boolean isClockInClockOutOnly() {
		return isEnabledByConfig() || attendanceModeProperties.isEnabled();
	}

	/**
	 * The admin-controlled per-tenant toggle persisted in attendance_config. A missing
	 * row (tenants predating the toggle) reads as false.
	 */
	protected boolean isEnabledByConfig() {
		AttendanceConfig config = attendanceConfigDao
			.findByAttendanceConfigType(AttendanceConfigType.CLOCK_IN_OUT_ONLY);
		return config != null && Boolean.parseBoolean(config.getAttendanceConfigValue());
	}

}
