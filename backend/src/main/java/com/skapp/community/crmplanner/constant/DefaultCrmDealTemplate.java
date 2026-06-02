package com.skapp.community.crmplanner.constant;

import java.util.Arrays;
import java.util.List;

import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.type.DefaultCrmDealStageValues;

public class DefaultCrmDealTemplate {

	public static List<CrmDealStage> getDefaultStages() {
		return Arrays.stream(DefaultCrmDealStageValues.values()).map(value -> {
			CrmDealStage stage = new CrmDealStage();
			stage.setName(value.getName());
			stage.setColor(value.getColor());
			stage.setOrderIndex(value.getOrderIndex());
			stage.setStageType(value.getStageType());
			return stage;
		}).toList();
	}

	private DefaultCrmDealTemplate() {
	}

}
