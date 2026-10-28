package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityCall;
import com.skapp.community.crmplanner.payload.response.CrmActivityCallResponseDto;
import com.skapp.community.crmplanner.type.CrmActivityCallFilterParams;

import java.util.List;

public interface CrmActivityCallRepository {

	List<CrmActivityCallResponseDto> findCalls(CrmActivityCallFilterParams params);

	CrmActivityCall findCallById(Long id);

}
