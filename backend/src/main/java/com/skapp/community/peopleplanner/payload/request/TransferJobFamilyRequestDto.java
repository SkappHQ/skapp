package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

@Getter
@Setter
public class TransferJobFamilyRequestDto {

	@NonNull
	private Long employeeId;

	@NonNull
	private Long jobFamilyId;

	@NonNull
	private Long jobTitleId;

}
