package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityFeedFilterDto;

public interface CrmActivityFeedService {

	ResponseEntityDto getActivities(CrmActivityFeedFilterDto filterDto);

}
