package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityMeeting;
import com.skapp.community.crmplanner.payload.response.CrmActivityMeetingResponseDto;
import com.skapp.community.crmplanner.type.CrmActivityMeetingFilterParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrmActivityMeetingRepository {

	Page<CrmActivityMeetingResponseDto> findMeetings(CrmActivityMeetingFilterParams params, Pageable pageable);

	CrmActivityMeeting findMeetingById(Long id);

}
