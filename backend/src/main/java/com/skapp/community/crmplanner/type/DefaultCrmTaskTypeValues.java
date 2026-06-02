package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DefaultCrmTaskTypeValues {

	CALL("Call", 1), EMAIL("Email", 2), MEETING("Meeting", 3), FOLLOW_UP("Follow-up", 4), DEMO("Demo", 5),
	OTHER("Other", 6);

	private final String name;

	private final int orderIndex;

}
