package com.skapp.community.common.payload.email;

import com.skapp.community.common.type.EmailButtonText;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommonEmailDynamicFields {

	private String organizationName;

	private String employeeOrManagerName;

	private String employeeName;

	private String managerName;

	private String workEmail;

	private String leaveType;

	private String leaveStartDate;

	private String leaveEndDate;

	private String leaveDuration;

	private String appUrl;

	private String buttonText = EmailButtonText.COMMON_EMAIL_BUTTON_TEXT.name();

}
