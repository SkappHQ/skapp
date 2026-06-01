package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmContactLookupResponseDto {

	private Long id;

	private String name;

	private CrmCompanyLookupResponseDto company;

}
