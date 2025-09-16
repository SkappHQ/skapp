package com.skapp.enterprise.invoice.payload.graphql.paginated;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaginationInput {

	private int limit;

	private String cursor;

	private String search;

}
