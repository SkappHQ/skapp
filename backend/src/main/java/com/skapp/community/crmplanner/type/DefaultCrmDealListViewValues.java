package com.skapp.community.crmplanner.type;

import java.util.List;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class DefaultCrmDealListViewValues {

	private final CrmDealListViewField field;

	private final int width;

	public static final List<DefaultCrmDealListViewValues> DEFAULT_FIELDS = List.of(
			new DefaultCrmDealListViewValues(CrmDealListViewField.DEAL_NAME, 400),
			new DefaultCrmDealListViewValues(CrmDealListViewField.VALUE, 140),
			new DefaultCrmDealListViewValues(CrmDealListViewField.STAGE, 140),
			new DefaultCrmDealListViewValues(CrmDealListViewField.COMPANY_NAME, 140),
			new DefaultCrmDealListViewValues(CrmDealListViewField.CONTACT_NAME, 140),
			new DefaultCrmDealListViewValues(CrmDealListViewField.PRIORITY, 140),
			new DefaultCrmDealListViewValues(CrmDealListViewField.DEAL_OWNER, 140));

}
