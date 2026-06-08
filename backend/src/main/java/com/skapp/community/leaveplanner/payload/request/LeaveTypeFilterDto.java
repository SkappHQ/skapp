package com.skapp.community.leaveplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class LeaveTypeFilterDto {

	private Boolean filterByInUse = false;

	private Boolean isCarryForward = false;

	private Long employeeId;

}
