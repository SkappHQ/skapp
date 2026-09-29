package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmIndustry;
import com.skapp.community.crmplanner.payload.request.CrmIndustryFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrmIndustryRepository {

	Page<CrmIndustry> findIndustries(CrmIndustryFilterDto filterDto, Pageable pageable);

}
