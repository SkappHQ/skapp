package com.skapp.enterprise.common.payload.redis;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpRedisUserVersionDto {

	private Long userId;

	private String userVersion;

}
