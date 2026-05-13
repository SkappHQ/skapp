package com.skapp.community.crmplanner.type;

import lombok.Getter;

@Getter
public enum CrmContactSort {

	NAME("name"), EMAIL("email"), CREATED_DATE("createdDate"), DEAL_VALUE("dealValue");

	private final String sortField;

	CrmContactSort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
