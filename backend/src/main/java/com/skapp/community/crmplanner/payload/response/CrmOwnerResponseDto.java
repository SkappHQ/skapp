package com.skapp.community.crmplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CrmOwnerResponseDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String authPic;

}
