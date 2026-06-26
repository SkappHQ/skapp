package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class GenderDistributionResponseDto {

	private Long totalActiveEmployees;

	private Long totalActiveMaleEmployees;

	private Long totalActiveFemaleEmployees;

	private Long totalActiveOtherEmployees;

}
