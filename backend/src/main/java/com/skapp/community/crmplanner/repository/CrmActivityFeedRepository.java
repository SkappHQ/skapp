package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.payload.response.CrmActivityFeedRowResponseDto;
import com.skapp.community.crmplanner.type.CrmActivityListParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrmActivityFeedRepository {

	Page<CrmActivityFeedRowResponseDto> findActivities(CrmActivityListParams params, Pageable pageable);

}
