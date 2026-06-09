package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.type.CrmContactDealMetrics;
import com.skapp.community.crmplanner.type.CrmDealSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CrmDealRepository {

	Page<CrmDeal> findDeals(CrmDealFilterDto filterDto, Pageable pageable);

	List<CrmDealSummary> findClosedDealSummaryByContactIds(List<Long> contactIds);

	String findMaxOrderIndexByStageId(Long stageId);

	List<CrmDeal> findByContactIdWithAssociations(Long contactId);

	CrmContactDealMetrics findDealMetricsByContactId(Long contactId);

}
