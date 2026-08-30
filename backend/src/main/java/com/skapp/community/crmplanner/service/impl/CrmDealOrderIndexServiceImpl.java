package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.util.FractionalIndexUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealOrderIndex;
import com.skapp.community.crmplanner.repository.CrmDealOrderIndexDao;
import com.skapp.community.crmplanner.service.CrmDealOrderIndexService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrmDealOrderIndexServiceImpl implements CrmDealOrderIndexService {

	private final CrmDealOrderIndexDao crmDealOrderIndexDao;

	@Override
	@Transactional
	public void createForNewDeal(CrmDeal deal) {
		if (deal.getId() != null && crmDealOrderIndexDao.existsById(deal.getId())) {
			return;
		}
		String maxListIndex = crmDealOrderIndexDao.findMaxListIndex();

		CrmDealOrderIndex orderIndex = new CrmDealOrderIndex();
		orderIndex.setDeal(deal);
		orderIndex.setBoard(deal.getOrderIndex());
		orderIndex.setList(FractionalIndexUtil.generateKeyBetween(maxListIndex, null));
		crmDealOrderIndexDao.save(orderIndex);

		log.info("createForNewDeal: order index created for deal id={}", deal.getId());
	}

	@Override
	@Transactional
	public void syncBoardKey(CrmDeal deal) {
		CrmDealOrderIndex orderIndex = crmDealOrderIndexDao.findByDealId(deal.getId()).orElse(null);
		if (orderIndex == null) {
			orderIndex = new CrmDealOrderIndex();
			orderIndex.setDeal(deal);
			orderIndex.setList(FractionalIndexUtil.generateKeyBetween(crmDealOrderIndexDao.findMaxListIndex(), null));
		}
		orderIndex.setBoard(deal.getOrderIndex());
		crmDealOrderIndexDao.save(orderIndex);
	}

	@Override
	@Transactional
	public void reorderInList(Long dealId, Long previousDealId, Long nextDealId) {
		CrmDealOrderIndex target = crmDealOrderIndexDao.findByDealId(dealId)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));

		String previousKey = resolveListKey(previousDealId);
		String nextKey = resolveListKey(nextDealId);
		target.setList(FractionalIndexUtil.generateKeyBetween(previousKey, nextKey));
		crmDealOrderIndexDao.save(target);

		log.info("reorderInList: deal id={} repositioned between {} and {}", dealId, previousDealId, nextDealId);
	}

	private String resolveListKey(Long dealId) {
		if (dealId == null) {
			return null;
		}
		return crmDealOrderIndexDao.findByDealId(dealId).map(CrmDealOrderIndex::getList).orElse(null);
	}

}
