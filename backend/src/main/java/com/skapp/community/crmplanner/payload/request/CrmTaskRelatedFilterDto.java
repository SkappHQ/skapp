package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmTaskRelatedFilterDto {

	private Long contactId;

	private Long dealId;

	private int page = 0;

	private int size = 10;

}
