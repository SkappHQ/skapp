package com.skapp.community.crmplanner.payload.request;

import com.skapp.enterprise.common.config.TrimmingStringDeserializer;
import com.skapp.community.crmplanner.type.CrmIndustry;
import com.skapp.community.crmplanner.util.deserializer.CrmIndustryDeserializer;
import lombok.Getter;
import lombok.Setter;
import tools.jackson.databind.annotation.JsonDeserialize;

@Getter
@Setter
public class CrmCompanyCreateDto {

	@JsonDeserialize(using = TrimmingStringDeserializer.class)
	private String name;

	@JsonDeserialize(using = CrmIndustryDeserializer.class)
	private CrmIndustry industry;

	@JsonDeserialize(using = TrimmingStringDeserializer.class)
	private String website;

	@JsonDeserialize(using = TrimmingStringDeserializer.class)
	private String address;

	@JsonDeserialize(using = TrimmingStringDeserializer.class)
	private String contactNumber;

}
