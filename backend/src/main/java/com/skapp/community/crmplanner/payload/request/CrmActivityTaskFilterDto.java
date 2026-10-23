package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmActivityTaskSort;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmActivityTaskFilterDto extends CrmActivityListFilterDto {

	private CrmActivityTaskSort sortKey;

}
