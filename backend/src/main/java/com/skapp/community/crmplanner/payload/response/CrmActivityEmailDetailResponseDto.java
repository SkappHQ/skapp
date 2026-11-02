package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class CrmActivityEmailDetailResponseDto {

	private Long id;

	private String subject;

	private String fromAddress;

	private Instant loggedAt;

	private String description;

	private Long ownerId;

	private List<CrmContactLookupResponseDto> to;

	private List<CrmContactLookupResponseDto> cc;

	private List<CrmContactLookupResponseDto> bcc;

	private CrmDealResponseDto deal;

	private CrmCompanyLookupResponseDto company;

}
