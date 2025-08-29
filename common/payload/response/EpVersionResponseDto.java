package com.skapp.enterprise.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpVersionResponseDto {

	private Long userId;

	private String systemVersion;

	private String userVersion;

}
