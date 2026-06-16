package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmTaskCompletedFilterDto extends CrmTaskFilterDto {

	private int page = 0;

	private int size = 10;

}
