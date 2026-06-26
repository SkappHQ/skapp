package com.skapp.community.leaveplanner.payload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeEntitlementTeamJobRoleDto {

	List<EmployeeLeaveEntitlementsDto> employeeLeaveEntitlementsDtos;

	private Long employeeId;

	private String employeeName;

	private String teams;

}
