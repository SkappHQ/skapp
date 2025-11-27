package com.skapp.enterprise.common.payload.response;

import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.peopleplanner.type.AccountStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpUserResponseDto {

	private String userId;

	private String firstName;

	private String lastName;

	private String email;

	private LoginMethod loginMethod;

	private String authPic;

	private AccountStatus accountStatus;

}
