package com.skapp.community.crmplanner.type;

import java.util.List;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class DefaultCrmIndustryValues {

	private final CrmIndustry name;

	public static final List<DefaultCrmIndustryValues> DEFAULT_INDUSTRIES = List.of(
			new DefaultCrmIndustryValues(CrmIndustry.ACCOMMODATION_SERVICES),
			new DefaultCrmIndustryValues(CrmIndustry.ADMINISTRATIVE_AND_SUPPORT_SERVICES),
			new DefaultCrmIndustryValues(CrmIndustry.CONSTRUCTION),
			new DefaultCrmIndustryValues(CrmIndustry.CONSUMER_SERVICES),
			new DefaultCrmIndustryValues(CrmIndustry.EDUCATION),
			new DefaultCrmIndustryValues(CrmIndustry.ENTERTAINMENT_PROVIDERS),
			new DefaultCrmIndustryValues(CrmIndustry.FARMING_RANCHING_FORESTRY),
			new DefaultCrmIndustryValues(CrmIndustry.FINANCIAL_SERVICES),
			new DefaultCrmIndustryValues(CrmIndustry.GOVERNMENT_ADMINISTRATION),
			new DefaultCrmIndustryValues(CrmIndustry.HOLDING_COMPANIES),
			new DefaultCrmIndustryValues(CrmIndustry.HOSPITALS_AND_HEALTH_CARE),
			new DefaultCrmIndustryValues(CrmIndustry.MANUFACTURING),
			new DefaultCrmIndustryValues(CrmIndustry.OIL_GAS_AND_MINING),
			new DefaultCrmIndustryValues(CrmIndustry.PROFESSIONAL_SERVICES),
			new DefaultCrmIndustryValues(CrmIndustry.REAL_ESTATE_AND_EQUIPMENT_RENTAL_SERVICES),
			new DefaultCrmIndustryValues(CrmIndustry.RETAIL),
			new DefaultCrmIndustryValues(CrmIndustry.TECHNOLOGY_INFORMATION_AND_MEDIA),
			new DefaultCrmIndustryValues(CrmIndustry.TRANSPORTATION_LOGISTICS_SUPPLY_CHAIN_AND_STORAGE),
			new DefaultCrmIndustryValues(CrmIndustry.UTILITIES), new DefaultCrmIndustryValues(CrmIndustry.WHOLESALE));

}
