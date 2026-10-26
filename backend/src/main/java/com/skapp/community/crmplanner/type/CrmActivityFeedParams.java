package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmActivityFeedParams extends CrmActivityListParams {

	private String type;

	private int page;

}
