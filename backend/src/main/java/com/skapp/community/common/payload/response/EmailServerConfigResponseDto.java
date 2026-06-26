package com.skapp.community.common.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmailServerConfigResponseDto {

	private String emailServiceProvider;

	private String username;

	private String appPassword;

	private Integer portNumber;

	private Boolean isEnabled;

}
