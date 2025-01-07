package com.skapp.enterprise.common.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpSignInGoogleDataDto {

	private String email;

	private String authPic;

	private String token;

}
