package com.skapp.enterprise.common.payload.response;

import com.skapp.community.common.payload.request.OrganizationDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpOrganizationResponseDto extends OrganizationDto {

	private String companyDomain;

	private String tenantId;

	private String uuid;

}
