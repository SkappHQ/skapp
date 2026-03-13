package com.skapp.enterprise.esignature.type;

import java.util.List;
import java.util.Set;

public enum FieldType {

	SIGNATURE, DATE, STAMP, INITIAL, APPROVE, DECLINE, NAME, EMAIL, TEXT, DROPDOWN, CHECKBOX, RADIO_BUTTON;

	public static List<FieldType> imageFieldTypes() {
		return List.of(SIGNATURE, STAMP, INITIAL);
	}

	public static Set<FieldType> advancedFieldTypes() {
		return Set.of(TEXT, DROPDOWN, RADIO_BUTTON, CHECKBOX);
	}

}
