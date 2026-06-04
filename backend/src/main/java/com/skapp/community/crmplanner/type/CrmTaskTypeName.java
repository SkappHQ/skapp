package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrmTaskTypeName {

	CALL("Call"), EMAIL("Email"), MEETING("Meeting"), OTHER("Other");

	private final String displayName;

}
