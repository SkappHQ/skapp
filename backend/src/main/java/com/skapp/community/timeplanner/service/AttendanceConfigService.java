package com.skapp.community.timeplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.timeplanner.payload.request.AttendanceConfigRequestDto;
import com.skapp.community.timeplanner.type.AttendanceConfigType;

public interface AttendanceConfigService {

	void setDefaultAttendanceConfig();

	ResponseEntityDto updateAttendanceConfig(AttendanceConfigRequestDto attendanceConfigRequestDto);

	ResponseEntityDto getAllAttendanceConfigs();

	boolean getAttendanceConfigByType(AttendanceConfigType attendanceConfigType);

}
