package com.skapp.community.crmplanner.payload.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmCompanyFilterDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	@Max(100)
	private int size = 10;

	@Size(max = 100)
	private String searchKeyword;

}
