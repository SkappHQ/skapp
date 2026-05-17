package com.skapp.community.crmplanner.payload.request;

import com.fasterxml.jackson.annotation.JsonSetter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CrmCompanyCreateDto {

	@NotBlank
	@Size(max = 30)
	private String name;

	@Size(max = 50)
	private String industry;

	@Size(max = 50)
	private String website;

	@Size(max = 100)
	private String address;

	@Size(min = 7, max = 15)
	private String contactNumber;

	@JsonSetter("name")
	public void setName(String name) {
		this.name = name != null ? name.trim() : null;
	}

}
