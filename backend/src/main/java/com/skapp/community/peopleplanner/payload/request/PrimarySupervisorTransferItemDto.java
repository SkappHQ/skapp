package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

@Getter
@Setter
public class PrimarySupervisorTransferItemDto {

	@NonNull
	private Long subordinateEmployeeId;

	@NonNull
	private Long newSupervisorId;

}
