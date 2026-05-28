package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.payload.request.CrmContactMetricRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrmContactRepository {

	Page<CrmContact> findContacts(CrmContactMetricRequestDto filterDto, Pageable pageable);

}
