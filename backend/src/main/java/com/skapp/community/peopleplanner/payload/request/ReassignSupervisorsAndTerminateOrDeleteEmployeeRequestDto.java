package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.peopleplanner.type.EmployeeRemoveAction;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ReassignSupervisorsAndTerminateOrDeleteEmployeeRequestDto {

	private List<PrimarySupervisorTransferDto> primarySupervisors;

	private List<TeamSupervisorTransferDto> teamSupervisors;

	private EmployeeRemoveAction action;

}
