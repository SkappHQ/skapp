package com.skapp.community.timeplanner.service;

import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.type.TimeAttendanceStatus;

public interface AttendanceStatusResolver {

	TimeAttendanceStatus resolveTimeStatus(TimeRecord timeRecord);

}
