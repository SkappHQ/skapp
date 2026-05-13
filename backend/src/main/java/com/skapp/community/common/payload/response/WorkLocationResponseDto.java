package com.skapp.community.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkLocationResponseDto {

	private Long workLocationId;

	private String name;

	private String address;

	private Long employeeCount;

}
