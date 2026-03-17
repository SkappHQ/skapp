package com.skapp.enterprise.common.type;

import lombok.Getter;

@Getter
public enum AnnouncementSortBy {

	CREATED_DATE("createdDate");

	private final String sortField;

	AnnouncementSortBy(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
