package com.skapp.enterprise.common.payload;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrganizationDetailsDto {

	private String companyName;

	private String currentTime;

	private long userCount;

	private String superAdminEmail;

	private String contactNumber;

}
