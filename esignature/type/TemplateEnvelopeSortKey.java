package com.skapp.enterprise.esignature.type;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum TemplateEnvelopeSortKey {

	NAME("name");

	private final String sortField;

	@Override
	public String toString() {
		return this.sortField;
	}

}
