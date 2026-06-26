package com.skapp.community.peopleplanner.payload.request.employee.emergency;

import com.skapp.community.peopleplanner.type.RelationshipTypes;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeEmergencyContactDetailsDto {

	private String name;

	private RelationshipTypes relationship;

	private String countryCode;

	private String contactNo;

}
