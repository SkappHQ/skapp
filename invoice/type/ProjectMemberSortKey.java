package com.skapp.enterprise.invoice.type;

import lombok.Getter;

@Getter
public enum ProjectMemberSortKey {

	NAME("fullName");

	private final String sortField;

	ProjectMemberSortKey(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
