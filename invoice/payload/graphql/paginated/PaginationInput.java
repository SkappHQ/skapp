package com.skapp.enterprise.invoice.payload.graphql.paginated;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaginationInput {

	private int limit;

	private String cursor;

	private String search;

	@Override
	public String toString() {
		return "Pagination{" + "cursor='" + cursor + '\'' + ", limit=" + limit + ", search='" + search + '\'' + '}';
	}

}
