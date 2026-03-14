package com.skapp.enterprise.common.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnnouncementListRequestFilterDto {

	private int pageNumber = 0;

	private int pageSize = 25;

	private String sortBy = "createdDate";

	private String sortDirection = "DESC";

}
