package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedRowResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrmActivityFeedRepository {

	Page<CrmActivityFeedRowResponseDto> findActivities(CrmActivityFeedFilterDto filterDto, Long currentEmployeeId,
			boolean isRestrictedToOwner, Pageable pageable);

}
