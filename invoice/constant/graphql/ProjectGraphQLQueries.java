package com.skapp.enterprise.invoice.constant.graphql;

public class ProjectGraphQLQueries {

	public static final String INTERNAL_PROJECTS_BASE_DATA = "query InternalProjects { " + "  internalProjects { "
			+ "    id " + "    key " + "    name " + "  } " + "}";

	public static final String INTERNAL_PROJECTS_MEMBERS_COUNT = "query InternalProjects { " + "  internalProjects { "
			+ "    id " + "    key " + "    name " + "    projectUsers { " + "      userId " + "      role " + "    } "
			+ "  } " + "}";

}
