package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.type.CrmActiveDealSummary;
import com.skapp.community.crmplanner.type.CrmDealSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CrmDealRepository {

List<CrmDealSummary> findClosedDealSummaryByContactIds(List<Long> contactIds);

List<CrmActiveDealSummary> findActiveDealSummaryByContactIds(List<Long> contactIds);

Page<CrmDeal> findAllDeals(CrmDealFilterDto filterDto, Pageable pageable);

}
