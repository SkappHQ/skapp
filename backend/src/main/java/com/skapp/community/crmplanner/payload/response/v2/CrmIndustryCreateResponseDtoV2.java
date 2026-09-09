package com.skapp.community.crmplanner.payload.response.v2;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmIndustryCreateResponseDtoV2 {

	private Long id;

	private String name;

	/**
	 * True when the industry already existed and was returned instead of being created.
	 * Lets the client select the existing record while still surfacing the duplicate
	 * warning, which is what happens when two users add the same name concurrently.
	 */
	private Boolean alreadyExists;

}
