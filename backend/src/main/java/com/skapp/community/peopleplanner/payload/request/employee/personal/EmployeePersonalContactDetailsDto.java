package com.skapp.community.peopleplanner.payload.request.employee.personal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeePersonalContactDetailsDto {

	private String personalEmail;

	private String countryCode;

	private String contactNo;

	private String addressLine1;

	private String addressLine2;

	private String city;

	private String state;

	private String country;

	private String postalCode;

}
