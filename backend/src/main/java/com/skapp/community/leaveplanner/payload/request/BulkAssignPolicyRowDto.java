package com.skapp.community.leaveplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BulkAssignPolicyRowDto {

	private String employeeName;

	private String policyName;

	private String effectiveDate;

}
