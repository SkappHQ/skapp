package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.AnnouncementSortBy;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class AnnouncementListRequestFilterDto {

	private int pageNumber = 0;

	private int pageSize = 25;

	private AnnouncementSortBy sortBy = AnnouncementSortBy.CREATED_DATE;

	private Sort.Direction sortDirection = Sort.Direction.DESC;

}
