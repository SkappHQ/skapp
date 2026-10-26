package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmActivityEmailSort;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmActivityEmailFilterDto extends CrmActivityListFilterDto {

	private CrmActivityEmailSort sortKey;

}
