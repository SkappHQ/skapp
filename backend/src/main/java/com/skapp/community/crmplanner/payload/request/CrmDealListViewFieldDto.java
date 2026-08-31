package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmDealListViewField;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealListViewFieldDto {

	private CrmDealListViewField field;

	private Long fieldId;

	private Integer width;

	private Boolean isVisible;

	private Boolean isHideable;

	private Boolean isSortable;

	private Boolean isDraggable;

	private Boolean isGroupable;

	private Boolean isResizable;

}
