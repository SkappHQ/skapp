package com.skapp.enterprise.common.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class DeviceTokenResponseDto {

	private Long id;

	private String token;

	private LocalDateTime creationDate;

}
