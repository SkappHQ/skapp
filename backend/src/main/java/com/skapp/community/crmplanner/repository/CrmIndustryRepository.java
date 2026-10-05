package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.payload.request.CrmIndustryFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmIndustryLookupResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrmIndustryRepository {

	Page<CrmIndustryLookupResponseDto> findIndustriesForLookup(CrmIndustryFilterDto filterDto, Pageable pageable);

}
