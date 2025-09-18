package com.skapp.enterprise.invoice.type;

import lombok.Getter;

@Getter
public enum DocumentSortKey {

	ID("id");

	private final String sortField;

	DocumentSortKey(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
