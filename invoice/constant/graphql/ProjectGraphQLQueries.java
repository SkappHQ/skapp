package com.skapp.enterprise.invoice.constant.graphql;

public class ProjectGraphQLQueries {

	public static final String PROJECTS_WITH_PAGINATED = "query ProjectsWithPaginated($pagination: PaginationInput) { "
			+ "  projectsWithPaginated(pagination: $pagination) { " + "    edges { cursor node { id key name } } "
			+ "    pageInfo { endCursor hasNextPage hasPreviousPage startCursor } " + "    totalCount " + "  } " + "}";

}
