package com.skapp.community.peopleplanner.payload.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PrimarySupervisorTransferItemDto {

	@NotNull
	@Positive
	private Long subordinateEmployeeId;

	@NotNull
	@Positive
	private Long newSupervisorId;

}
