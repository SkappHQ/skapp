package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.payload.response.CrmActivityEmailResponseDto;
import com.skapp.community.crmplanner.type.CrmActivityEmailFilterParams;

import java.util.List;

public interface CrmActivityEmailRepository {

	List<CrmActivityEmailResponseDto> findEmails(CrmActivityEmailFilterParams params);

}
