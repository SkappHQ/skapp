package com.skapp.community.crmplanner.service.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import org.springframework.data.domain.Pageable;

public interface CrmCompanyServiceV2 {

	ResponseEntityDto getCompanyMetrics(String searchKeyword, Pageable pageable);

}
