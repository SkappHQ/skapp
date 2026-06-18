package com.skapp.community.common.payload.request;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkLocationFilterDto {

	private int page = 0;

	private int size = 4;

	private String searchKeyword;

}
