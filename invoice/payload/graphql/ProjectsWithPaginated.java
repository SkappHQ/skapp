package com.skapp.enterprise.invoice.payload.graphql;

import com.skapp.enterprise.invoice.payload.graphql.paginated.Edge;
import com.skapp.enterprise.invoice.payload.graphql.paginated.PageInfo;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProjectsWithPaginated {

	private List<Edge> edges;

	private PageInfo pageInfo;

	private int totalCount;

}
