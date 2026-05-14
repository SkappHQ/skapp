package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmDealSort;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class CrmDealFilterDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 10;

	private Sort.Direction sortOrder = Sort.Direction.DESC;

	private CrmDealSort sortKey = CrmDealSort.CREATED_DATE;

	private String searchKeyword;

	private Long stageId;

	private Long priorityId;

}
