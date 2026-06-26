package com.skapp.community.leaveplanner.payload.email;

import com.skapp.community.common.payload.email.CommonEmailDynamicFields;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeaveEmailDynamicFields extends CommonEmailDynamicFields {

	private String leaveDuration;

	private String comment;

	private String employeesName;

	private String duration;

	private String validFrom;

	private String validTo;

}
