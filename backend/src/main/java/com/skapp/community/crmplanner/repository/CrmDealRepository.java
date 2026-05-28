package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.skapp.community.crmplanner.type.CrmDealSummary;
import java.util.List;

public interface CrmDealRepository {

	Page<CrmDeal> findDeals(CrmDealFilterDto filterDto, Pageable pageable);

	List<CrmDealSummary> findClosedDealSummaryByContactIds(List<Long> contactIds);

}
