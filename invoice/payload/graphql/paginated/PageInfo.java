package com.skapp.enterprise.invoice.payload.graphql.paginated;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PageInfo {

	private String endCursor;

	private boolean hasNextPage;

	private boolean hasPreviousPage;

	private String startCursor;

}
