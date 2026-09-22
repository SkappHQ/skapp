package com.skapp.community.leaveplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PolicyLeaveTypeFilterDto {

	private int page = 0;

	private int size = 20;

	private Boolean isActive;

}
