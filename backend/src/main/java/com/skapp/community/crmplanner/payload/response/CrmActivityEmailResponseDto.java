package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CrmActivityEmailResponseDto {

	private Long id;

	private String subject;

	private Instant loggedAt;

	private Long ownerId;

	private Long dealId;

	private Long companyId;

	private List<Long> contactIds;

}
