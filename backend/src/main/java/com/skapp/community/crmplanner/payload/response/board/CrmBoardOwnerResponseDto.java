package com.skapp.community.crmplanner.payload.response.board;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CrmBoardOwnerResponseDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String authPic;

}
