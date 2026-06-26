package com.skapp.community.peopleplanner.payload.response.export;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeePersonalInfoExportDto {

	private String birthDate;

	private String bloodGroup;

	private String nationality;

	private String maritalStatus;

	private String city;

	private String state;

	private String postalCode;

	private String ethnicity;

	private EmployeeExtraInfoExportDto extraInfo;

	private EmployeeSocialMediaExportDto socialMediaDetails;

	private String nin;

	private String passportNo;

	private String ssn;

}
