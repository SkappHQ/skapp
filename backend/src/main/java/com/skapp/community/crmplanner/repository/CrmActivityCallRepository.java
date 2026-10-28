package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityCall;
import com.skapp.community.crmplanner.payload.response.CrmActivityCallResponseDto;
import com.skapp.community.crmplanner.type.CrmActivityCallFilterParams;

import java.util.List;
import java.util.Optional;

public interface CrmActivityCallRepository {

	List<CrmActivityCallResponseDto> findCalls(CrmActivityCallFilterParams params);

	Optional<CrmActivityCall> findCallById(Long id);

}
