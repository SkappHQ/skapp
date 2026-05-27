package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmContactMetricRequestDto {

	private int page = 0;

	private int size = 10;

	private String searchKeyword;

	private Long companyId;

}
