package com.skapp.enterprise.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.enterprise.leaveplanner.payload.request.EpOutOfOfficeEventRequestDto;

public interface EpLeaveCalendarService {

	ResponseEntityDto getDateRangeAndWorkingHoursForLeave(Long id);

	ResponseEntityDto addOutOfOfficeEventsForLeave(EpOutOfOfficeEventRequestDto epOutOfOfficeEventRequestDto);

	void deleteOutOfOfficeEventsForLeave(LeaveRequest leaveRequest);

	ResponseEntityDto addMicrosoftOutOfOfficeEventsForLeave(EpOutOfOfficeEventRequestDto epOutOfOfficeEventRequestDto);

	ResponseEntityDto getMicrosoftDateRangeAndWorkingHoursForLeave(Long id);

	void deleteMicrosoftOutOfOfficeEventsForLeave(LeaveRequest leaveRequest);

}
