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
		log.info("createForNewDeal: execution started");
		String maxListIndex = resolveMaxListKey();

		CrmDealOrderIndex orderIndex = new CrmDealOrderIndex();
		orderIndex.setDealId(deal.getId());
		orderIndex.setBoard(deal.getOrderIndex());
		orderIndex.setList(FractionalIndexUtil.generateKeyBetween(maxListIndex, null));
		crmDealOrderIndexDao.save(orderIndex);

		log.info("createForNewDeal: execution ended");
	}

	@Override
	@Transactional
	public void reorderInList(Long dealId, Long previousDealId, Long nextDealId) {
		log.info("reorderInList: execution started");
		CrmDealOrderIndex target = crmDealOrderIndexDao.findById(dealId)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));

		String previousKey = resolveListKey(previousDealId);
		String nextKey = resolveListKey(nextDealId);
		target.setList(FractionalIndexUtil.generateKeyBetween(previousKey, nextKey));
		crmDealOrderIndexDao.save(target);

		log.info("reorderInList: execution ended");
	}

	private String resolveListKey(Long dealId) {
		if (dealId == null) {
			return null;
		}
		return crmDealOrderIndexDao.findById(dealId).map(CrmDealOrderIndex::getList).orElse(null);
	}

	private String resolveMaxListKey() {
		return crmDealOrderIndexDao.findTopByOrderByListDesc().map(CrmDealOrderIndex::getList).orElse(null);
	}

}
