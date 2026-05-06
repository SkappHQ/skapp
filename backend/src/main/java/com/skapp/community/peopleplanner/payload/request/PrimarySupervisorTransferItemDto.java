package com.skapp.community.peopleplanner.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PrimarySupervisorTransferItemDto {

	@NotNull
	private Long subordinateEmployeeId;

	@NotNull
	private Long newSupervisorId;

}
