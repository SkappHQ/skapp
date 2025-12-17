package com.skapp.enterprise.common.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EpGuestUserUpdateRequestDto {

	private Long id;

	private String email;

	private List<ProjectRequestDto> projects;

}
