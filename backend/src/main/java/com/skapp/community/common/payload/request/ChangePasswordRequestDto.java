package com.skapp.community.common.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequestDto {

	private String oldPassword;

	private String newPassword;

}
