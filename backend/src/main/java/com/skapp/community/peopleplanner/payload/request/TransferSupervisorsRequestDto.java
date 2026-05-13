package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TransferSupervisorsRequestDto {

	private List<PrimarySupervisorTransferItemDto> primarySupervisors;

	private List<TeamSupervisorTransferItemDto> teamSupervisors;

}
