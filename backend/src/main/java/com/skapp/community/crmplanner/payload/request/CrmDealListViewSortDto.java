package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmDealListViewField;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class CrmDealListViewSortDto {

	private CrmDealListViewField field;

	private Sort.Direction direction;

}
