package com.skapp.community.crmplanner.payload.response;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmCompanyDomainSearchResponseDto {

	private List<CrmCompanyResponseDto> companies;

}
