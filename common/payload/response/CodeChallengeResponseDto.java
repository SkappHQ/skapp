package com.skapp.enterprise.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CodeChallengeResponseDto {

	private String accessToken;

	private String refreshToken;

}
