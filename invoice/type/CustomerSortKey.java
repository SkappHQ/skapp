package com.skapp.enterprise.invoice.type;

import lombok.Getter;

@Getter
public enum CustomerSortKey {

	NAME("name");

	private final String sortField;

	CustomerSortKey(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
