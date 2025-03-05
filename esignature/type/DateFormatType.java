package com.skapp.enterprise.esignature.type;

public enum DateFormatType {

	DD_MM_YYYY("DD/MM/YYYY"), YYYY_MM_DD("YYYY/MM/DD"), MM_DD_YYYY("MM/DD/YYYY");

	private String value;

	DateFormatType(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

}
