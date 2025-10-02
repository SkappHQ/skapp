package com.skapp.enterprise.invoice.payload.response.project;

import com.skapp.enterprise.invoice.payload.response.ProjectUsersResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TenantProjectUserResponseDto {

	private Long id;

	private String key;

	private String name;

	private List<ProjectUsersResponseDto> projectUsers;

}
