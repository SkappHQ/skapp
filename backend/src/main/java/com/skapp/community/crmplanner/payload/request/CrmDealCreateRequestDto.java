package com.skapp.community.crmplanner.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmDealCreateRequestDto {

	@NotBlank(message = "{crm.error.deal.name-required}")
	private String name;

	@NotNull(message = "{crm.error.deal.stage-not-found}")
	private Long stageId;

	private Long priorityId;

	private LocalDateTime closingAt;

	private String amount;

	private Long companyId;

	@NotNull(message = "{crm.error.deal.contact-not-found}")
	private Long contactId;

	@NotNull(message = "{crm.error.deal.owner-not-found}")
	private Long ownerId;

}
