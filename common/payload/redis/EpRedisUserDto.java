package com.skapp.enterprise.common.payload.redis;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpRedisUserDto {

	private Long userId;

	private String email;

	private String firstName;

	private String lastName;

	private String authPic;

}
