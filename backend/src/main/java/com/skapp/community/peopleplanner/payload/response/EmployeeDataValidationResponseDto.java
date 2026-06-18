package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EmployeeDataValidationResponseDto {

	private Boolean isIdentificationNoExists;

	private Boolean isWorkEmailExists;

	private Boolean isGoogleDomain;

	private Boolean isGuestUser;

	private Boolean isTerminatedUser;

}
