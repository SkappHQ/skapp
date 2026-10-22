package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.payload.response.CrmActivityCallResponseDto;
import com.skapp.community.crmplanner.type.CrmActivityCallFilterParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrmActivityCallRepository {

	Page<CrmActivityCallResponseDto> findCalls(CrmActivityCallFilterParams params, Pageable pageable);

}
