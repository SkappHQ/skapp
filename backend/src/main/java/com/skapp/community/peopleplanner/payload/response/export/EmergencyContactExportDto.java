package com.skapp.community.peopleplanner.payload.response.export;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmergencyContactExportDto {

	private String name;

	private String emergencyRelationship;

	private String contactNo;

	private Boolean isPrimary;

}
