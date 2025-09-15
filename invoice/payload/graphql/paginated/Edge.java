package com.skapp.enterprise.invoice.payload.graphql.paginated;

import com.skapp.enterprise.invoice.payload.graphql.ProjectPaginatedNode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Edge {

	private String cursor;

	private ProjectPaginatedNode node;

}
