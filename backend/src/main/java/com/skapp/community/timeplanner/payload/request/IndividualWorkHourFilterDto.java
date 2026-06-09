package com.skapp.community.timeplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IndividualWorkHourFilterDto {

	private int month;

	private long employeeId;

}
