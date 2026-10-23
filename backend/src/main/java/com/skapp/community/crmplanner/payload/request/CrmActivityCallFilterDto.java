package com.skapp.community.crmplanner.payload.request;

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

	private CrmActivityCallSort sortKey;

	private Sort.Direction sortOrder;

}
