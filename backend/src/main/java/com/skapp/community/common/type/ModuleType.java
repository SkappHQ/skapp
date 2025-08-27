package com.skapp.community.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Getter
@RequiredArgsConstructor
public enum ModuleType {

	COMMON("common"), ATTENDANCE("attendance"), PEOPLE("people"), LEAVE("leave"), ESIGN("esignature"), OKR("okr"),
	INVOICE("invoice"), PM("projectmanagement");

	private static final Map<String, ModuleType> DISPLAY_NAME_MAP = Stream.of(values())
		.collect(Collectors.toMap(ModuleType::getDisplayName, module -> module));

	private final String displayName;

	public static ModuleType fromDisplayName(String displayName) {
		ModuleType moduleType = DISPLAY_NAME_MAP.get(displayName.toLowerCase());
		if (moduleType == null) {
			throw new IllegalArgumentException("No enum constant for display name: " + displayName);
		}
		return moduleType;
	}

}
