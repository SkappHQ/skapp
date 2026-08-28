package com.skapp.community.crmplanner.constant;

import java.util.ArrayList;
import java.util.List;

import com.skapp.community.crmplanner.model.CrmIndustry;
import com.skapp.community.crmplanner.type.DefaultCrmIndustryValues;

import lombok.experimental.UtilityClass;

@UtilityClass
public class DefaultCrmIndustryTemplate {

	public static List<CrmIndustry> getDefaultIndustries() {
		List<CrmIndustry> industries = new ArrayList<>();
		for (DefaultCrmIndustryValues value : DefaultCrmIndustryValues.DEFAULT_INDUSTRIES) {
			industries.add(toCrmIndustryEntity(value));
		}
		return industries;
	}

	private static CrmIndustry toCrmIndustryEntity(DefaultCrmIndustryValues value) {
		CrmIndustry industry = new CrmIndustry();
		industry.setName(value.getName().name());
		return industry;
	}

}
