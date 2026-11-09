package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityRecordFilterDto;

public interface CrmActivityFeedService {

	ResponseEntityDto getActivities(CrmActivityFeedFilterDto filterDto);

	ResponseEntityDto getRecordActivities(CrmActivityRecordFilterDto filterDto);

}
