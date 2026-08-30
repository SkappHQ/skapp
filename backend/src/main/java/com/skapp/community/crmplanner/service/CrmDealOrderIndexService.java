package com.skapp.community.crmplanner.service;

import com.skapp.community.crmplanner.model.CrmDeal;

public interface CrmDealOrderIndexService {

	void createForNewDeal(CrmDeal deal);

	void reorderInList(Long dealId, Long previousDealId, Long nextDealId);

}
