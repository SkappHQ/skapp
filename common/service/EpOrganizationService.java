package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.EpCalendarConfigRequestDto;
import com.skapp.enterprise.common.payload.request.EpOrganizationDto;

import java.util.List;

public interface EpOrganizationService {

	ResponseEntityDto saveOrganization(EpOrganizationDto organizationDto);

	ResponseEntityDto getTenantLoginType(String tenantName);

	ResponseEntityDto saveCalendarConfigs(List<EpCalendarConfigRequestDto> epCalendarConfigRequestDtos);

	ResponseEntityDto getCalendarConfigs();

}
