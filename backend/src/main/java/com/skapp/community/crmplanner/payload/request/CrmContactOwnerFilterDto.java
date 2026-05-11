package com.skapp.community.crmplanner.payload.request;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmContactOwnerFilterDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 10;

	private String searchKeyword;

}
