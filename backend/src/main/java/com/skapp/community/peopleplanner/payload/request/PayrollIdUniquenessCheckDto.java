package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PayrollIdUniquenessCheckDto {

	private Long employeeId;

	private String payrollId;

}
