package com.skapp.community.crmplanner.type;

import lombok.Getter;

@Getter
public enum CrmDealStageType {

	INITIAL(1), OPEN(2), WON(3), LOST(4);

	private final int displayOrder;

	CrmDealStageType(int displayOrder) {
		this.displayOrder = displayOrder;
	}

}
