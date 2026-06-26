package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransferTeamMembersDto {

	private Long employeeId;

	private Long teamId;

}
