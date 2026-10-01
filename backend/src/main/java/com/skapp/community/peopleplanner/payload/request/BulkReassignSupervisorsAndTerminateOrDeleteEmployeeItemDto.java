package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BulkReassignSupervisorsAndTerminateOrDeleteEmployeeItemDto
		extends ReassignSupervisorsAndTerminateOrDeleteEmployeeRequestDto {

	private Long userId;

}
