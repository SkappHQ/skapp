package com.skapp.community.crmplanner.type;

import lombok.Getter;

@Getter
public enum CrmDealSort {

	NAME("name"), CREATED_DATE("createdDate"), CLOSING_AT("closingAt"), AMOUNT("amount"), STAGE_TYPE("stage.stageType"),
	STAGE("stage.orderIndex"), COMPANY("company.name"), CONTACT("contact.name"), PRIORITY("priority"),
	OWNER("owner.firstName");

	private final String sortField;

	CrmDealSort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
