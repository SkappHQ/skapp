package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmActivityCallSort;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmActivityCallFilterDto extends CrmActivityListFilterDto {

	private CrmActivityCallSort sortKey;

}
