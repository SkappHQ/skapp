package com.skapp.enterprise.esignature.type;

import lombok.Getter;

@Getter
public enum EnvelopeSentSort {

	CREATED_DATE("sentAt");

	private final String sortField;

	EnvelopeSentSort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
