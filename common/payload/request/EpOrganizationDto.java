package com.skapp.enterprise.common.payload.request;

import com.skapp.community.common.payload.request.OrganizationDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpOrganizationDto extends OrganizationDto {

	private String companyDomain;

	private String contactNo;

    private String partnerId;

}
