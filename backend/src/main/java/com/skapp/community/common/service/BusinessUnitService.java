package com.skapp.community.common.service;

import com.skapp.community.common.payload.request.BusinessUnitRequestDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;

public interface BusinessUnitService {

	ResponseEntityDto createBusinessUnit(BusinessUnitRequestDto businessUnitRequestDto);

	ResponseEntityDto updateBusinessUnit(Long id, BusinessUnitRequestDto businessUnitRequestDto);

	ResponseEntityDto getBusinessUnitSummary(Long id);

	ResponseEntityDto deleteBusinessUnit(Long id, Long transferToBusinessUnitId);

	ResponseEntityDto getAllBusinessUnits();

}
