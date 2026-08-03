package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;
import org.openapitools.jackson.nullable.JsonNullable;

@Getter
@Setter
public class CrmContactEditRequestDto {

	private String firstName;

	private JsonNullable<String> lastName = JsonNullable.undefined();

	private String email;

	private JsonNullable<Long> companyId = JsonNullable.undefined();

	private String contactNumber;

	private Long ownerId;

}
