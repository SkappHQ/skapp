package com.skapp.enterprise.common.payload;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpRedisEmployeeDto {

	private Long userId;

	private String email;

	private String firstName;

	private String lastName;

	private String authPic;

}
