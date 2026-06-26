package com.skapp.community.peopleplanner.payload.email;

import com.skapp.community.common.payload.email.CommonEmailDynamicFields;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PeopleEmailDynamicFields extends CommonEmailDynamicFields {

	private String temporaryPassword;

	private String terminationDate;

	private String holidayDate;

	private String holidayName;

	private String revisedDuration;

	private String requestDateTime;

	private String otp;

	private String tenantId;

	private String tenantUrl;

}
