package com.skapp.community.crmplanner.payload.request;

import com.fasterxml.jackson.annotation.JsonSetter;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrmCompanyCreateDto {

	@NotBlank
	private String name;

	private String industry;

	private String website;

	private String address;

	private String contactNumber;

	@JsonSetter("name")
	public void setName(String name) {
		this.name = name != null ? name.trim() : null;
	}

}
