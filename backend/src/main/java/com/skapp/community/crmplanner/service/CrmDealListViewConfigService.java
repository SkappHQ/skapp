package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import tools.jackson.databind.JsonNode;

public interface CrmDealListViewConfigService {

	ResponseEntityDto getListViewConfig();

	ResponseEntityDto updateListViewConfig(JsonNode config);

}
