package com.skapp.community.timeplanner.service.impl;

import com.skapp.community.timeplanner.model.AttendanceConfig;
import com.skapp.community.timeplanner.repository.AttendanceConfigDao;
import com.skapp.community.timeplanner.service.AttendanceModeService;
import com.skapp.community.timeplanner.type.AttendanceConfigType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AttendanceModeServiceImpl implements AttendanceModeService {

	private final AttendanceConfigDao attendanceConfigDao;

	@Override
	public boolean isClockInClockOutOnly() {
		AttendanceConfig config = attendanceConfigDao
			.findByAttendanceConfigType(AttendanceConfigType.CLOCK_IN_OUT_ONLY);
		return config != null && Boolean.parseBoolean(config.getAttendanceConfigValue());
	}

}
