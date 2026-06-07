package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmIndustry;
import com.skapp.enterprise.common.config.TrimmingStringDeserializer;
import lombok.Getter;
import lombok.Setter;
import tools.jackson.databind.annotation.JsonDeserialize;

@Getter
@Setter
public class CrmCompanyEditDto {

	@JsonDeserialize(using = TrimmingStringDeserializer.class)
	private String name;

	private CrmIndustry industry;

	private String website;

	private String address;

	private String contactNumber;

}
