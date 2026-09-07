package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CrmContactResponseDto {

	private Long id;

	private String name;

	private String email;

	private String contactNumber;

	private Instant lastContactAt;

	private Instant lastModifiedDate;

	private CrmCompanyLookupResponseDto company;

	private CrmContactOwnerResponseDto owner;

}
