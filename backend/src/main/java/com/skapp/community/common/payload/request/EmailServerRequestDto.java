package com.skapp.community.common.payload.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class EmailServerRequestDto {

	private String emailServiceProvider;

	private String username;

	private String appPassword;

	private Integer portNumber;

	private Boolean isEnabled = true;

}
