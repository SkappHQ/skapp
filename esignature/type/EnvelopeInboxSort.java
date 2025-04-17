package com.skapp.enterprise.esignature.type;

import lombok.Getter;

@Getter
public enum EnvelopeInboxSort {

	RECEIVED_DATE("receivedAt");

	private final String sortField;

	EnvelopeInboxSort(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
