package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BulkReassignAndRemoveEmployeeItemDto {

	private Long userId;

	private List<PrimarySupervisorTransferDto> primarySupervisors;

	private List<TeamSupervisorTransferDto> teamSupervisors;

}
