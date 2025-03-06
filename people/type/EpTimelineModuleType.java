package com.skapp.enterprise.people.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EpTimelineModuleType {

	COMMON("Common - "), ATTENDANCE("Attendance - "), PEOPLE("People - "), LEAVE("Leave - "), ESIGN("Esignature - ");

	private final String displayName;

}
