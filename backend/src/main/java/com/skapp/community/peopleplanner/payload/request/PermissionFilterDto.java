package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.common.type.EmployeeUserRole;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PermissionFilterDto {

	private String keyword;

	private EmployeeUserRole userRole;

}
