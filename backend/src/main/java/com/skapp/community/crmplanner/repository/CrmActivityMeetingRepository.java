package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.payload.request.CrmActivityMeetingFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityMeetingResponseDto;

import java.time.ZoneId;
import java.util.List;

public interface CrmActivityMeetingRepository {

	List<CrmActivityMeetingResponseDto> findMeetings(CrmActivityMeetingFilterDto filterDto, Long currentEmployeeId,
			boolean isRestrictedToOwner, ZoneId zone);

}
