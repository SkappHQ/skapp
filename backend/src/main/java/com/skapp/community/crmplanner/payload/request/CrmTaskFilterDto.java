package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmTaskFilterDto {

	private String searchKeyword;

	private Long contactId;

	private Long dealId;

}
