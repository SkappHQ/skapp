package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.peopleplanner.type.BloodGroup;
import com.skapp.community.peopleplanner.type.Ethnicity;
import com.skapp.community.peopleplanner.type.MaritalStatus;
import lombok.Getter;
import lombok.Setter;
import tools.jackson.databind.JsonNode;

@Getter
@Setter
public class EmployeeBulkPersonalInfoDto {

	private String city;

	private String state;

	private String postalCode;

	private String birthDate;

	private Ethnicity ethnicity;

	private String ssn;

	private String nationality;

	private String nin;

	private MaritalStatus maritalStatus;

	private JsonNode socialMediaDetails;

	private BloodGroup bloodGroup;

	private JsonNode extraInfo;

	private String passportNo;

}
