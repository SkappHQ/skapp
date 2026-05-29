package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmOwnerResponseDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String authPic;

}
