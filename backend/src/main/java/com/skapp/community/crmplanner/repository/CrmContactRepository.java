package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.payload.response.CrmContactListItemDto;
import com.skapp.community.crmplanner.payload.response.CrmContactLookupResponseDto;
import com.skapp.community.crmplanner.payload.request.CrmContactFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmContactMetricRequestDto;
import com.skapp.community.crmplanner.payload.response.v2.CrmBoardContactResponseDtoV2;
import com.skapp.community.crmplanner.type.CrmContactMetrics;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface CrmContactRepository {

	Page<CrmContactListItemDto> getContactMetrics(CrmContactMetricRequestDto filterDto, Pageable pageable);

	Optional<CrmContactMetrics> getContactMetricsById(Long contactId);

	Page<CrmContactLookupResponseDto> findContactsForLookup(CrmContactFilterDto filterDto, Pageable pageable);

	List<CrmContact> findAllContactsForBoardInit();

	List<CrmBoardContactResponseDtoV2> findAllContactsForBoardInitV2();

	CrmContact findByIdWithAssociations(Long id);

}
