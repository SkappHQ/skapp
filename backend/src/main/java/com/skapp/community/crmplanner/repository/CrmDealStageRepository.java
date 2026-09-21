package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmDealStage;

import java.util.List;

public interface CrmDealStageRepository {

	Integer findNextOrderIndex();

	void insertAll(List<CrmDealStage> dealStages);

}
