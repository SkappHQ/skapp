package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.common.type.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmContactOwnerResponseDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String email;

	private String authPic;

	private Role crmRole;

}
