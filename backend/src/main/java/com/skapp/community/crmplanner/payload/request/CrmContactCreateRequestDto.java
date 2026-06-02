package com.skapp.community.crmplanner.payload.request;

import com.skapp.enterprise.common.config.TrimmingStringDeserializer;
import lombok.Getter;
import lombok.Setter;
import tools.jackson.databind.annotation.JsonDeserialize;

@Getter
@Setter
public class CrmContactCreateRequestDto {

	@JsonDeserialize(using = TrimmingStringDeserializer.class)
	private String name;

	@JsonDeserialize(using = TrimmingStringDeserializer.class)
	private String email;

	private Long companyId;

	@JsonDeserialize(using = TrimmingStringDeserializer.class)
	private String contactNumber;

	private Long ownerId;

}
