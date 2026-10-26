package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.payload.response.CrmActivityFeedRowResponseDto;
import com.skapp.community.crmplanner.type.CrmActivityFeedFilterParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrmActivityFeedRepository {

	Page<CrmActivityFeedRowResponseDto> findActivities(CrmActivityFeedFilterParams params, Pageable pageable);

}
