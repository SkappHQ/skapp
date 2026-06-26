package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.peopleplanner.type.BloodGroup;
import com.skapp.community.peopleplanner.type.Ethnicity;
import com.skapp.community.peopleplanner.type.MaritalStatus;
import com.skapp.community.peopleplanner.util.deserializer.BloodGroupDeserializer;
import com.skapp.community.peopleplanner.util.deserializer.EthnicityDeserializer;
import com.skapp.community.peopleplanner.util.deserializer.MaritalStatusDeserializer;
import lombok.Getter;
import lombok.Setter;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.annotation.JsonDeserialize;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeePersonalInfoDto {

	private Long personalInfoId;

	private String city;

	private String state;

	private String postalCode;

	private LocalDate birthDate;

	@JsonDeserialize(using = EthnicityDeserializer.class)
	private Ethnicity ethnicity;

	private String ssn;

	private JsonNode previousEmploymentDetails;

	private String nationality;

	private String nin;

	private String passportNo;

	@JsonDeserialize(using = MaritalStatusDeserializer.class)
	private MaritalStatus maritalStatus;

	private JsonNode socialMediaDetails;

	@JsonDeserialize(using = BloodGroupDeserializer.class)
	private BloodGroup bloodGroup;

	private JsonNode extraInfo;

}
