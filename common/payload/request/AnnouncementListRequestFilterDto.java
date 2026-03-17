package com.skapp.enterprise.common.payload.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class AnnouncementListRequestFilterDto {

	private int pageNumber = 0;

	private int pageSize = 25;

	private String sortBy = "createdDate";

	private Sort.Direction sortDirection = Sort.Direction.DESC;

}
