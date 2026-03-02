package com.skapp.enterprise.esignature.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum EsignImageType {

	CHECKBOX_CHECKED("checkbox-checked.svg"), CHECKBOX_UNCHECKED("checkbox-unchecked.svg"),
	RADIO_BUTTON_CHECKED("radio-button-checked.svg"), RADIO_BUTTON_UNCHECKED("radio-button-unchecked.svg");

	private final String filename;

}
