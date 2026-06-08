package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.payload.request.CrmContactFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmContactMetricRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CrmContactRepository {

	Page<CrmContact> findContacts(CrmContactMetricRequestDto filterDto, Pageable pageable);

	Page<CrmContact> findContactsForLookup(CrmContactFilterDto filterDto, Pageable pageable);

	List<CrmContact> findAllContactsForBoardInit();

	CrmContact findByIdWithAssociations(Long id);

}
