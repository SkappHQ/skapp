package com.skapp.community.peopleplanner.payload.request;

import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TransferSupervisorsRequestDto {

	@Valid
	private List<PrimarySupervisorTransferItemDto> primarySupervisors;

	@Valid
	private List<TeamSupervisorTransferItemDto> teamSupervisors;

}
