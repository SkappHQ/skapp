package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.payload.response.CrmActivityMeetingResponseDto;
import com.skapp.community.crmplanner.type.CrmActivityMeetingFilterParams;

import java.util.List;

public interface CrmActivityMeetingRepository {

	List<CrmActivityMeetingResponseDto> findMeetings(CrmActivityMeetingFilterParams params);

}
