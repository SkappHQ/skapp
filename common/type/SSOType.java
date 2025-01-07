package com.skapp.enterprise.common.type;

public enum SSOType {

	GOOGLE("gmail"), NONE("none"), OUTLOOK("outlook");

	public final String label;

	SSOType(String label) {
		this.label = label;
	}

}
