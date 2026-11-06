package com.skapp.community.peopleplanner.payload.request.employee.employment;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeEmploymentBillingDetailsDto {

	private Double billableRate;

	private String billableRateCurrency;

}
