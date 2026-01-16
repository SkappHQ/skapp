package com.skapp.enterprise.esignature.type;

public enum TemplateEnvelopeSortKey {

	NAME("name");

	private final String sortField;

	TemplateEnvelopeSortKey(String sortField) {
		this.sortField = sortField;
	}

	@Override
	public String toString() {
		return this.sortField;
	}

}
