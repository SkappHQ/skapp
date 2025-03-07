package com.skapp.enterprise.people.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransferSupervisorsRequestDto {

	private Long supervisorId;

	private Long transferredSupervisorId;

}
