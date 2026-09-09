package com.skapp.community.crmplanner.payload.request;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealListViewConfigDto {

	private List<CrmDealListViewFieldDto> fields;

	private CrmDealListViewSortDto sort;

}
