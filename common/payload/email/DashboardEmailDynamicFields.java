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

	private String contactNumber;

	private String upgradeDateTime;

	private String signedUpDateTime;

	private String cancellationDateTime;

	private String subscriptionStartDate;

}
