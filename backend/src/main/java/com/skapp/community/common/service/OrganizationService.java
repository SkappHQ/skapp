package com.skapp.community.common.service;

import com.skapp.community.common.payload.request.EmailServerRequestDto;
import com.skapp.community.common.payload.request.OrganizationDto;
import com.skapp.community.common.payload.request.UpdateOrganizationRequestDto;
import com.skapp.community.common.payload.response.EmailServerConfigResponseDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;

public interface OrganizationService {

	ResponseEntityDto saveOrganization(OrganizationDto organizationDto);

	ResponseEntityDto getOrganization();

	ResponseEntityDto saveEmailServerConfigs(EmailServerRequestDto emailServerRequestDto);

	EmailServerConfigResponseDto getEmailServiceConfigs();

	ResponseEntityDto getOrganizationConfigs();

	ResponseEntityDto updateOrganization(UpdateOrganizationRequestDto organizationDto);

	String getOrganizationTimeZone();

}
