package com.skapp.enterprise.invoice.type;

import lombok.Getter;

@Getter
public enum ProjectSortKey {

	NAME("name");

	private final String sortField;

	ProjectSortKey(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
