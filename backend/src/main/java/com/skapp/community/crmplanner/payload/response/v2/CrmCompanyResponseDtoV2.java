package com.skapp.community.crmplanner.payload.response.v2;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmCompanyResponseDtoV2 {

	private Long id;

	private String name;

	private Long industryId;

	private String website;

	private String address;

	private String contactNumber;

}
