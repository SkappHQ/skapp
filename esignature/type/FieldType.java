package com.skapp.enterprise.esignature.type;

import java.util.List;

public enum FieldType {

	SIGNATURE, DATE, STAMP, INITIAL, APPROVE, DECLINE, NAME, EMAIL, TEXT, DROPDOWN, CHECKBOX, RADIO;

	public static List<FieldType> imageFieldTypes() {
		return List.of(SIGNATURE, STAMP, INITIAL);
	}

}
