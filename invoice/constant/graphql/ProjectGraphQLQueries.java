package com.skapp.enterprise.invoice.constant.graphql;

public class ProjectGraphQLQueries {

	public static final String INTERNAL_PROJECTS = """
			query InternalProjects {
									internalProjects {
													id
													key
													name
									}
					}
				\s""";

}
