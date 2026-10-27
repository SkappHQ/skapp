package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.constant.CrmConstants;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmActivityFeedFilterDto extends CrmActivityListFilterDto {

	private int page = 0;

	private int size = CrmConstants.ACTIVITY_FEED_DEFAULT_PAGE_SIZE;

}
