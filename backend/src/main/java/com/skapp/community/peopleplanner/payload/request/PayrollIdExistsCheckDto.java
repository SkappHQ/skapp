package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PayrollIdExistsCheckDto {

	private Long employeeId;

	private String payrollId;

}
