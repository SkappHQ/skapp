package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class CrmActivityFeedFilterParams extends CrmActivityListParams {

	private Set<CrmActivityType> types;

}
