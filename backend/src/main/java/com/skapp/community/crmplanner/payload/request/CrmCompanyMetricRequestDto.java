package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmCompanyMetricRequestDto {

	private int page;

	private int size;

	private String searchKeyword;

}
