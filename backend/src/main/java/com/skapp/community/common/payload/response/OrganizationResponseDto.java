package com.skapp.community.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrganizationResponseDto {

	private String organizationName;

	private String organizationWebsite;

	private String country;

	private String organizationTimeZone;

	private String organizationLogo;

	private String themeColor;

}
