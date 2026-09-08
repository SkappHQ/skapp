package com.skapp.community.crmplanner.constant;

import java.util.List;

import com.skapp.community.crmplanner.payload.request.CrmDealListViewConfigDto;
import com.skapp.community.crmplanner.payload.request.CrmDealListViewFieldDto;
import com.skapp.community.crmplanner.type.DefaultCrmDealListViewValues;

import lombok.experimental.UtilityClass;

@UtilityClass
public class DefaultCrmDealListViewTemplate {

	public static CrmDealListViewConfigDto build() {
		List<CrmDealListViewFieldDto> fields = DefaultCrmDealListViewValues.DEFAULT_FIELDS.stream()
			.map(DefaultCrmDealListViewTemplate::toFieldDto)
			.toList();

		CrmDealListViewConfigDto config = new CrmDealListViewConfigDto();
		config.setFields(fields);
		config.setSort(null);
		return config;
	}

	private static CrmDealListViewFieldDto toFieldDto(DefaultCrmDealListViewValues value) {
		CrmDealListViewFieldDto dto = new CrmDealListViewFieldDto();
		dto.setField(value.getField());
		dto.setWidth(value.getWidth());
		dto.setIsVisible(true);
		dto.setIsHideable(value.isHideable());
		dto.setIsSortable(true);
		dto.setIsDraggable(true);
		dto.setIsGroupable(false);
		dto.setIsResizable(true);
		return dto;
	}

}
