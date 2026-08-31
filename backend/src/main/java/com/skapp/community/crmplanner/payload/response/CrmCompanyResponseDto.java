package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmIndustryName;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmCompanyResponseDto {

	private Long id;

	private String name;

	private CrmIndustryName industry;

	private String website;

	private String address;

	private String contactNumber;

}
