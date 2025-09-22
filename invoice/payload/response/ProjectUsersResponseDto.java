package com.skapp.enterprise.invoice.payload.response;

import com.skapp.enterprise.invoice.type.ProjectUserRole;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectUsersResponseDto {

	private Long userId;

	private ProjectUserRole role;

}
