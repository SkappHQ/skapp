package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmDealListViewConfigDto;

public interface CrmDealListViewConfigService {

	ResponseEntityDto getListViewConfig();

	ResponseEntityDto updateListViewConfig(CrmDealListViewConfigDto config);

}
