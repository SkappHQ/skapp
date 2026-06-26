package com.skapp.community.peopleplanner.type;

import lombok.Getter;

@Getter
public enum HolidaySort {

	DATE("date"), CREATION_DATE("creationDate");

	private final String sortField;

	HolidaySort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
