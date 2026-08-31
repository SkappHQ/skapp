package com.skapp.community.crmplanner.constant;

import java.util.ArrayList;
import java.util.List;

import com.skapp.community.crmplanner.model.CrmIndustry;
import com.skapp.community.crmplanner.type.CrmIndustryName;

import lombok.experimental.UtilityClass;

@UtilityClass
public class DefaultCrmIndustryTemplate {

	public static List<CrmIndustry> getDefaultIndustries() {
		List<CrmIndustry> industries = new ArrayList<>();
		for (CrmIndustryName name : CrmIndustryName.values()) {
			industries.add(toCrmIndustryEntity(name));
		}
		return industries;
	}

	private static CrmIndustry toCrmIndustryEntity(CrmIndustryName name) {
		CrmIndustry industry = new CrmIndustry();
		industry.setName(name.getDisplayName());
		return industry;
	}

}
