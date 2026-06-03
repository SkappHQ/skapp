package com.skapp.community.crmplanner.constant;

import java.util.List;

import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.type.DefaultCrmDealStageValues;

import lombok.experimental.UtilityClass;

@UtilityClass
public class DefaultCrmDealTemplate {

	public static List<CrmDealStage> getDefaultStages() {
		return List.of(stage(DefaultCrmDealStageValues.LEAD), stage(DefaultCrmDealStageValues.QUALIFIED),
				stage(DefaultCrmDealStageValues.DEMO_SCHEDULED), stage(DefaultCrmDealStageValues.PROPOSAL_SENT),
				stage(DefaultCrmDealStageValues.NEGOTIATION), stage(DefaultCrmDealStageValues.WON),
				stage(DefaultCrmDealStageValues.LOST));
	}

	private static CrmDealStage stage(DefaultCrmDealStageValues value) {
		CrmDealStage stage = new CrmDealStage();
		stage.setName(value.getName());
		stage.setColor(value.getColor().name());
		stage.setOrderIndex(value.getOrderIndex());
		stage.setStageType(value.getStageType());
		return stage;
	}

}
