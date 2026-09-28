package com.skapp.community.crmplanner.type;

import java.util.List;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class DefaultCrmDealListViewValues {

	private final CrmDealListViewField field;

	private final int width;

	private final boolean hideable;

	public static final List<DefaultCrmDealListViewValues> DEFAULT_FIELDS = List.of(
			new DefaultCrmDealListViewValues(CrmDealListViewField.NAME, 400, false),
			new DefaultCrmDealListViewValues(CrmDealListViewField.AMOUNT, 140, true),
			new DefaultCrmDealListViewValues(CrmDealListViewField.STAGE, 140, true),
			new DefaultCrmDealListViewValues(CrmDealListViewField.COMPANY, 140, true),
			new DefaultCrmDealListViewValues(CrmDealListViewField.CONTACT, 140, true),
			new DefaultCrmDealListViewValues(CrmDealListViewField.PRIORITY, 140, true),
			new DefaultCrmDealListViewValues(CrmDealListViewField.OWNER, 140, true));

}
