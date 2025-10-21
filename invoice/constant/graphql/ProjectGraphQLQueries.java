package com.skapp.enterprise.invoice.constant.graphql;

import lombok.experimental.UtilityClass;

@UtilityClass
public class ProjectGraphQLQueries {

	public static final String INTERNAL_PROJECTS_BASE_DATA = "query InternalProjects { " + "  internalProjects { "
			+ "    id " + "    key " + "    name " + "  } " + "}";

	public static final String INTERNAL_PROJECTS_MEMBERS_COUNT = "query InternalProjects { " + "  internalProjects { "
			+ "    id " + "    key " + "    name " + "    projectUsers { " + "      userId " + "      role " + "    } "
			+ "  } " + "}";

	public static final String INTERNAL_TIME_LOGS_BY_PROJECT_RESOURCE = "query InternalUserWorklogsByProject($input: WorklogDateRangeInput!) {"
			+ "  internalUserWorklogsByProject(input: $input) {" + "    billableTime" + "    totalTime" + "    userId"
			+ "  }" + "}";

	public static final String INTERNAL_TIME_LOGS_BY_PROJECT_TASK = "query InternalWorklogsByProject($input: WorklogDateRangeInput!) {"
			+ "  internalWorklogsByProject(input: $input) {" + "    billableTime" + "    isDeleted"
			+ "    itemInfoWorkLog {" + "      workType" + "      userId" + "      time" + "    }" + "	 id"
			+ "    title" + "    totalTime" + "  }" + "}";

}
