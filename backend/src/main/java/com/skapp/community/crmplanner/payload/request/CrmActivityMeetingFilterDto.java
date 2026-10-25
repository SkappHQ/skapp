package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmActivityMeetingSort;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmActivityMeetingFilterDto extends CrmActivityListFilterDto {

	private CrmActivityMeetingSort sortKey;

}
