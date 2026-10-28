package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;
import org.openapitools.jackson.nullable.JsonNullable;

import java.time.Instant;

@Getter
@Setter
public class CrmActivityCallPatchRequestDto {

	private String subject;

	private Instant loggedAt;

	private JsonNullable<Integer> durationMinutes = JsonNullable.undefined();

	private Long contactId;

	private JsonNullable<Long> dealId = JsonNullable.undefined();

	private JsonNullable<Long> companyId = JsonNullable.undefined();

	private Long ownerId;

	private JsonNullable<String> comments = JsonNullable.undefined();

}
