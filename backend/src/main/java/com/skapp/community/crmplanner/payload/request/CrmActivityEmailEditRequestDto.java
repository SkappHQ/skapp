package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class CrmActivityEmailEditRequestDto {

	private String fromAddress;

	private Instant loggedAt;

	private List<Long> toContactIds;

	private List<Long> ccContactIds;

	private List<Long> bccContactIds;

	private String subject;

	private Long dealId;

	private Long companyId;

	private String description;

}
