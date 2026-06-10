package com.skapp.community.crmplanner.type;

import java.util.List;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class DefaultCrmTaskTypeValues {

	private final CrmTaskTypeName name;

	private final int orderIndex;

	public static final List<DefaultCrmTaskTypeValues> DEFAULT_TASK_TYPES = List.of(
			new DefaultCrmTaskTypeValues(CrmTaskTypeName.CALL, 1),
			new DefaultCrmTaskTypeValues(CrmTaskTypeName.EMAIL, 2),
			new DefaultCrmTaskTypeValues(CrmTaskTypeName.MEETING, 3),
			new DefaultCrmTaskTypeValues(CrmTaskTypeName.OTHER, 4));

}
