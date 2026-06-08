package com.skapp.community.crmplanner.constant;

import java.util.List;

import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.type.DefaultCrmDealStageValues;

import lombok.experimental.UtilityClass;

@UtilityClass
public class DefaultCrmDealStageTemplate {

	public static List<CrmDealStage> getDefaultStages() {
		return DefaultCrmDealStageValues.DEFAULT_STAGES.stream()
			.map(DefaultCrmDealStageTemplate::toCrmDealStageEntity)
			.toList();
	}

	private static CrmDealStage toCrmDealStageEntity(DefaultCrmDealStageValues value) {
		CrmDealStage stage = new CrmDealStage();
		stage.setName(value.getStage().getName());
		stage.setColor(value.getColor().name());
		stage.setOrderIndex(value.getOrderIndex());
		stage.setStageType(value.getStageType());
		return stage;
	}

}
