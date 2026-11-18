package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityEmail;
import com.skapp.community.crmplanner.payload.response.CrmActivityEmailResponseDto;
import com.skapp.community.crmplanner.type.CrmActivityEmailFilterParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrmActivityEmailRepository {

	Page<CrmActivityEmailResponseDto> findEmails(CrmActivityEmailFilterParams params, Pageable pageable);

	CrmActivityEmail findEmailById(Long id);

}
