package com.skapp.enterprise.common.payload.email;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DashboardEmailDynamicFields {

	private String tenantId;

	private String companyName;

	private long userCount;

	private String superAdminEmail;

	private String superAdminName;

	private String contactNumber;

	private String upgradedDateTime;

	private String signedUpDateTime;

	private String cancelledDateTime;

	private String subscriptionStartDate;

	private String issueType;

	private String submittedDateTime;

	private String details;

	private int noOfAttachments = 0;

}
