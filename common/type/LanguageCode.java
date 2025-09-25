package com.skapp.enterprise.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum LanguageCode {

	ENGLISH("en"), SWEDISH("sv"), FRENCH("fr"), GERMAN("de"), SPANISH("es");

	private final String code;

}
