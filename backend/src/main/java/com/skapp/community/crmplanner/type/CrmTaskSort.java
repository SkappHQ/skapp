package com.skapp.community.crmplanner.type;

import lombok.Getter;

@Getter
public enum CrmTaskSort {

	DUE_AT("dueAt"), LAST_MODIFIED_DATE("lastModifiedDate");

	private final String sortField;

	CrmTaskSort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
