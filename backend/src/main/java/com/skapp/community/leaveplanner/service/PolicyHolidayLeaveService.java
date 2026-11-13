package com.skapp.community.leaveplanner.service;

import com.skapp.community.peopleplanner.model.Holiday;

public interface PolicyHolidayLeaveService {

	void adjustLeaveRequestsForHoliday(Holiday holiday);

}
