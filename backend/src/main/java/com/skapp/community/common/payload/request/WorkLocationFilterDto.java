package com.skapp.community.common.payload.request;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkLocationFilterDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 4;

	private String searchKeyword;

}
