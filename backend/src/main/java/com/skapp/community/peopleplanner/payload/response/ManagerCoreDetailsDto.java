package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ManagerCoreDetailsDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String middleName;

	private String authPic;

}
