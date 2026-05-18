package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrmDealSort {

	NAME("name"), CREATED_DATE("createdDate"), CLOSING_AT("closingAt"), AMOUNT("amount"), STAGE_TYPE("stage.stageType");

	private final String dbField;

}
