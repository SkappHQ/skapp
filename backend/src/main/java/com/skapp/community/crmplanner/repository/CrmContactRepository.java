package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.payload.request.CrmContactFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmContactMetricRequestDto;
import com.skapp.community.crmplanner.payload.response.v2.CrmContactMetricsResponseDtoV2;
import com.skapp.community.crmplanner.type.CrmContactMetrics;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface CrmContactRepository {

	Page<CrmContact> findContacts(CrmContactMetricRequestDto filterDto, Pageable pageable);

	Page<CrmContactMetricsResponseDtoV2> getContactMetricsV2(CrmContactMetricRequestDto filterDto, Pageable pageable);

	Optional<CrmContactMetrics> getContactMetricsById(Long contactId);

	Page<CrmContact> findContactsForLookup(CrmContactFilterDto filterDto, Pageable pageable);

	List<CrmContact> findAllContactsForBoardInit();

	CrmContact findByIdWithAssociations(Long id);

}
