package com.skapp.community.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PageDto {

	private Object items;

	private int currentPage;

	private Long totalItems;

	private int totalPages;

	public PageDto() {
		this.currentPage = 0;
		this.totalItems = 0L;
		this.totalPages = 0;
	}

}
