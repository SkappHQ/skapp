package com.skapp.community.crmplanner.payload.request;

import com.skapp.enterprise.common.config.TrimmingStringDeserializer;
import lombok.Getter;
import lombok.Setter;
import tools.jackson.databind.annotation.JsonDeserialize;

@Getter
@Setter
public class CrmCompanyCreateDto {

	@JsonDeserialize(using = TrimmingStringDeserializer.class)
	private String name;

	private String industry;

	private String website;

	private String address;

	private String contactNumber;

}
