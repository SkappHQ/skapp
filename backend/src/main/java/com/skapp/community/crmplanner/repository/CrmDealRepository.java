package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.request.board.CrmDealsByStagesRequestDto;
import com.skapp.community.crmplanner.payload.response.v2.CrmDealResponseDtoV2;
import com.skapp.community.crmplanner.type.CrmContactDealMetrics;
import com.skapp.community.crmplanner.type.CrmDealSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface CrmDealRepository {

	Page<CrmDeal> findDeals(CrmDealFilterDto filterDto, Long ownerId, Pageable pageable);

	Page<CrmDealResponseDtoV2> findDealsV2(CrmDealFilterDto filterDto, Long ownerId, Pageable pageable);

	List<CrmDealResponseDtoV2> findDealsByIds(List<Long> dealIds, Long ownerId);

	List<CrmDealSummary> findClosedDealSummaryByContactIds(List<Long> contactIds);

	Page<CrmDeal> findDealsByStageId(Long stageId, CrmDealsByStagesRequestDto requestDto, Long ownerId,
			Pageable pageable, long preComputedTotal);

	Map<Long, Long> countDealsByStageIds(List<Long> stageIds, CrmDealsByStagesRequestDto requestDto, Long ownerId);

	String findMaxOrderIndexByStageId(Long stageId);

	String findMinOrderIndexByStageId(Long stageId);

	List<CrmDeal> findByContactIdWithAssociations(Long contactId);

	CrmDeal findByIdWithAssociations(Long id);

	CrmContactDealMetrics findDealMetricsByContactId(Long contactId);

}
