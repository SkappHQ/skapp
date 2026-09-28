package com.skapp.community.crmplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmContactLookupResponseDto {

	private Long id;

	private String name;

	private Long companyId;

}
