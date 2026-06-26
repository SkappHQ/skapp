package com.skapp.community.peopleplanner.payload.request.employee;

import com.skapp.community.peopleplanner.type.AccountStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeCommonDetailsDto {

	private Long employeeId;

	private String authPic;

	private AccountStatus accountStatus;

	private String jobTitle;

}
