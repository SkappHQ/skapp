package com.skapp.community.leaveplanner.service;

import com.skapp.community.peopleplanner.model.Holiday;

import java.util.List;

public interface PolicyHolidayLeaveService {

	void adjustLeaveRequestsForHoliday(Holiday holiday);

	boolean hasLeaveRequestsOnHolidays(List<Holiday> holidays);

}
