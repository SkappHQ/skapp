package com.skapp.community.crmplanner.service.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyBatchRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyMetricRequestDto;

public interface CrmCompanyServiceV2 {

	ResponseEntityDto getCompanyMetrics(CrmCompanyMetricRequestDto requestDto);

	ResponseEntityDto getCompaniesByIds(CrmCompanyBatchRequestDto requestDto);

}
