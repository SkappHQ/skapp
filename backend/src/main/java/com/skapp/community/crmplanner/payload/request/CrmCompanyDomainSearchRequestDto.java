package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmCompanyDomainSearchRequestDto {

	private String domain;

	private int limit;

}
