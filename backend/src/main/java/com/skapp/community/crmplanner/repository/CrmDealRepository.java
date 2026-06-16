package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.request.board.CrmDealsByStagesRequestDto;
import com.skapp.community.crmplanner.type.CrmContactDealMetrics;
import com.skapp.community.crmplanner.type.CrmDealSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface CrmDealRepository {

	Page<CrmDeal> findDeals(CrmDealFilterDto filterDto, Pageable pageable);

	List<CrmDealSummary> findClosedDealSummaryByContactIds(List<Long> contactIds);

	Page<CrmDeal> findDealsByStageId(Long stageId, CrmDealsByStagesRequestDto requestDto, Pageable pageable);

	Page<CrmDeal> findDealsByStageId(Long stageId, CrmDealsByStagesRequestDto requestDto, Pageable pageable,
			long preComputedTotal);

	Map<Long, Long> countDealsByStageIds(List<Long> stageIds, CrmDealsByStagesRequestDto requestDto);

	String findMaxOrderIndexByStageId(Long stageId);

	List<CrmDeal> findByContactIdWithAssociations(Long contactId);

	CrmContactDealMetrics findDealMetricsByContactId(Long contactId);

}
