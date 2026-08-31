package com.skapp.community.crmplanner.type;

import java.util.List;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class DefaultCrmIndustryValues {

	private final CrmIndustryName name;

	public static final List<DefaultCrmIndustryValues> DEFAULT_INDUSTRIES = List.of(
			new DefaultCrmIndustryValues(CrmIndustryName.ACCOMMODATION_SERVICES),
			new DefaultCrmIndustryValues(CrmIndustryName.ADMINISTRATIVE_AND_SUPPORT_SERVICES),
			new DefaultCrmIndustryValues(CrmIndustryName.CONSTRUCTION),
			new DefaultCrmIndustryValues(CrmIndustryName.CONSUMER_SERVICES),
			new DefaultCrmIndustryValues(CrmIndustryName.EDUCATION),
			new DefaultCrmIndustryValues(CrmIndustryName.ENTERTAINMENT_PROVIDERS),
			new DefaultCrmIndustryValues(CrmIndustryName.FARMING_RANCHING_FORESTRY),
			new DefaultCrmIndustryValues(CrmIndustryName.FINANCIAL_SERVICES),
			new DefaultCrmIndustryValues(CrmIndustryName.GOVERNMENT_ADMINISTRATION),
			new DefaultCrmIndustryValues(CrmIndustryName.HOLDING_COMPANIES),
			new DefaultCrmIndustryValues(CrmIndustryName.HOSPITALS_AND_HEALTH_CARE),
			new DefaultCrmIndustryValues(CrmIndustryName.MANUFACTURING),
			new DefaultCrmIndustryValues(CrmIndustryName.OIL_GAS_AND_MINING),
			new DefaultCrmIndustryValues(CrmIndustryName.PROFESSIONAL_SERVICES),
			new DefaultCrmIndustryValues(CrmIndustryName.REAL_ESTATE_AND_EQUIPMENT_RENTAL_SERVICES),
			new DefaultCrmIndustryValues(CrmIndustryName.RETAIL),
			new DefaultCrmIndustryValues(CrmIndustryName.TECHNOLOGY_INFORMATION_AND_MEDIA),
			new DefaultCrmIndustryValues(CrmIndustryName.TRANSPORTATION_LOGISTICS_SUPPLY_CHAIN_AND_STORAGE),
			new DefaultCrmIndustryValues(CrmIndustryName.UTILITIES),
			new DefaultCrmIndustryValues(CrmIndustryName.WHOLESALE));

}
