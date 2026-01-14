package com.skapp.community.peopleplanner.payload.response.export;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeExtraInfoExportDto {

	private String allergies;

	private String dietaryRestrictions;

	@JsonProperty("tShirtSize")
	private String tShirtSize;

}
