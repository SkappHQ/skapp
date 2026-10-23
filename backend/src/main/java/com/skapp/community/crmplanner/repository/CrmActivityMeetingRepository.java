package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.payload.response.CrmActivityMeetingResponseDto;
import com.skapp.community.crmplanner.type.CrmActivityMeetingFilterParams;

import java.util.Collection;
import java.util.List;
import java.util.Map;

public interface CrmActivityMeetingRepository {

	List<CrmActivityMeetingResponseDto> findMeetings(CrmActivityMeetingFilterParams params);

	Map<Long, List<Long>> findContactIdsByMeetingIds(Collection<Long> meetingIds);

}
