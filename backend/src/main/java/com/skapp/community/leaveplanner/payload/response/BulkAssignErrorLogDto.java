package com.skapp.community.leaveplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BulkAssignErrorLogDto {

	private String employeeName;

	private String policyName;

	private String effectiveDate;

	private String error;

}
