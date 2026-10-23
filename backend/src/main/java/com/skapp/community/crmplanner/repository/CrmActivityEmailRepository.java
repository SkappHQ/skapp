package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.payload.response.CrmActivityEmailResponseDto;
import com.skapp.community.crmplanner.type.CrmActivityEmailFilterParams;

import java.util.Collection;
import java.util.List;
import java.util.Map;

public interface CrmActivityEmailRepository {

	List<CrmActivityEmailResponseDto> findEmails(CrmActivityEmailFilterParams params);

	Map<Long, List<Long>> findContactIdsByEmailId(Collection<Long> emailIds);

}
