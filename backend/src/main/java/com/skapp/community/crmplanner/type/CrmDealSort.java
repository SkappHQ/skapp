package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrmDealSort {

	NAME("name"),
	CREATED_DATE("createdDate"),
	CLOSING_AT("closingAt"),
	AMOUNT("amount");

	private final String dbField;

}
