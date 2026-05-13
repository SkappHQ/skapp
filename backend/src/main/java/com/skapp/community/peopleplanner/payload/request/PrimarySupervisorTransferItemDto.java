package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PrimarySupervisorTransferItemDto {

	private Long subordinateEmployeeId;

	private Long newSupervisorId;

}
