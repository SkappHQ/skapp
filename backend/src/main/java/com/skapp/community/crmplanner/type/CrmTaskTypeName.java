package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrmTaskTypeName {

	CALL("CALL"), EMAIL("EMAIL"), MEETING("MEETING"), OTHER("OTHER");

	private final String displayName;

}
