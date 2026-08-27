package com.skapp.community.crmplanner.constant;

import java.util.List;

import com.skapp.community.crmplanner.model.CrmIndustry;
import com.skapp.community.crmplanner.type.DefaultCrmIndustryValues;

import lombok.experimental.UtilityClass;

@UtilityClass
public class DefaultCrmIndustryTemplate {

	public static List<CrmIndustry> getDefaultIndustries() {
		return DefaultCrmIndustryValues.DEFAULT_INDUSTRIES.stream()
			.map(DefaultCrmIndustryTemplate::toCrmIndustryEntity)
			.toList();
	}

	private static CrmIndustry toCrmIndustryEntity(DefaultCrmIndustryValues value) {
		CrmIndustry industry = new CrmIndustry();
		industry.setName(value.getName().name());
		return industry;
	}

}
