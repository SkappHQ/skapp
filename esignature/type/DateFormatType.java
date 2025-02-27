package com.skapp.enterprise.esignature.type;

public enum DateFormatType {

	DD_MM_YYYY("dd/MM/yyyy"), YYYY_MM_DD("yyyy/MM/dd"), MM_DD_YYYY("MM/dd/yyyy");

	private String value;

	DateFormatType(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

}
