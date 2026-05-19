package com.skapp.community.crmplanner.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmDealCreateRequestDto {

	@NotBlank(message = "Deal name is required")
	private String name;

	@NotNull(message = "Deal stage is required")
	private Long stageId;

	private Long priorityId;

	private LocalDateTime closingAt;

	private String amount;

	private Long companyId;

	private Long ownerId;

}
