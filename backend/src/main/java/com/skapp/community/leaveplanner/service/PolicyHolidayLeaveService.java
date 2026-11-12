package com.skapp.community.leaveplanner.service;

import com.skapp.community.peopleplanner.model.Holiday;

import java.time.LocalDate;

public interface PolicyHolidayLeaveService {

	void adjustLeaveRequestsForHoliday(Holiday holiday);

	boolean hasLeaveRequestsOnDate(LocalDate date);

}
