package com.skapp.enterprise.common.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SaveModulesResponseDto {

	private List<String> activeModules;

	private String accessToken;

	private String refreshToken;

}
