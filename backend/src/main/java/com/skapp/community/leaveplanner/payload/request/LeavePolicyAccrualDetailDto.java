package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.type.AccrualFrequency;
import com.skapp.community.leaveplanner.type.AccrualTiming;
import com.skapp.community.leaveplanner.type.FirstAccrualType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeavePolicyAccrualDetailDto {

	private Float accrualDays;

	private AccrualFrequency frequency;

	private Integer waitingPeriodDays;

	private Float accrualCapDays;

	private Boolean isCarryoverEnabled;

	private String carryoverDate;

	private Float maxCarryoverDays;

	private FirstAccrualType firstAccrual = FirstAccrualType.PRORATED;

	private AccrualTiming accrualTiming = AccrualTiming.PERIOD_END;

}
