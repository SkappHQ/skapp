package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class LeaveCycleDetailsDto {

	int startMonth;

	int endMonth;

	int startDate;

	int endDate;

	Boolean isDefault;

}
