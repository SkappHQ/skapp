package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityMeetingCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityMeetingEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityMeetingFilterDto;

public interface CrmActivityMeetingService {

	ResponseEntityDto getMeetings(CrmActivityMeetingFilterDto filterDto);

	ResponseEntityDto createMeeting(CrmActivityMeetingCreateRequestDto requestDto);

	ResponseEntityDto getMeetingById(Long id);

	ResponseEntityDto editMeeting(Long id, CrmActivityMeetingEditRequestDto requestDto);

	ResponseEntityDto deleteMeeting(Long id);

}
