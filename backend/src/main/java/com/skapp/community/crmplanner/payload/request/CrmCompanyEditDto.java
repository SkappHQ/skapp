package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmIndustry;
import lombok.Getter;
import lombok.Setter;
import org.openapitools.jackson.nullable.JsonNullable;

@Getter
@Setter
public class CrmCompanyEditDto {

	private String name;

	private CrmIndustry industry;

	private JsonNullable<String> website = JsonNullable.undefined();

	private JsonNullable<String> address = JsonNullable.undefined();

	private JsonNullable<String> contactNumber = JsonNullable.undefined();

}
