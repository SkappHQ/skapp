package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmTaskSort;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class CrmTaskFilterDtoV2 {

	private String searchKeyword;

	private Long contactId;

	private Long dealId;

	private Long companyId;

	private Boolean isCompleted;

	private CrmTaskSort sortKey;

	private Sort.Direction sortOrder;

	private int page = 0;

	private int size = 10;

}
