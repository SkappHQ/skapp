package com.skapp.community.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BusinessUnitSummaryResponseDto {

	private Long assignedEmployeeCount;

	private Boolean isOtherBusinessUnitsExist;

}
