package com.skapp.community.crmplanner.activity.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.activity.payload.request.CrmActivityFeedFilterDto;

public interface CrmActivityFeedService {

	ResponseEntityDto getActivityFeed(CrmActivityFeedFilterDto filterDto);

}
