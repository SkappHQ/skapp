package com.skapp.community.crmplanner.constant;

import java.util.List;

import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.type.DefaultCrmDealStageValues;

public class DefaultCrmDealTemplate {

	public static List<CrmDealStage> getDefaultStages() {
		return List.of(stage(DefaultCrmDealStageValues.NEW), stage(DefaultCrmDealStageValues.QUALIFIED),
				stage(DefaultCrmDealStageValues.IN_PROGRESS), stage(DefaultCrmDealStageValues.WON),
				stage(DefaultCrmDealStageValues.LOST));
	}

	private static CrmDealStage stage(DefaultCrmDealStageValues value) {
		CrmDealStage stage = new CrmDealStage();
		stage.setName(value.getName());
		stage.setColor(value.getColor());
		stage.setOrderIndex(value.getOrderIndex());
		stage.setStageType(value.getStageType());
		return stage;
	}

	private DefaultCrmDealTemplate() {
	}

}
