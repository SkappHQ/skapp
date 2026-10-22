package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.type.CrmActivityCallSort;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;

@Getter
@Setter
public class CrmActivityCallFilterDto {

	private String searchKeyword;

	private Long ownerId;

	private LocalDate startDate;

	private LocalDate endDate;

	private CrmActivityCallSort sortKey = CrmActivityCallSort.LOGGED_AT;

	private Sort.Direction sortOrder = Sort.Direction.DESC;

	private int page = 0;

	private int size = CrmConstants.ACTIVITY_PAGE_SIZE;

}
