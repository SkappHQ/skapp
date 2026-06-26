package com.skapp.community.leaveplanner.service;

import com.skapp.community.leaveplanner.payload.LeaveCycleDetailsDto;

import java.time.LocalDate;

public interface LeaveCycleService {

	LeaveCycleDetailsDto getLeaveCycleConfigs();

	LocalDate getLeaveCycleStartDate();

	LocalDate getLeaveCycleEndDate();

	boolean isInNextCycle(int startYear);

	boolean isInCurrentCycle(int year);

	boolean isInPreviousCycle(int year);

	void setLeaveCycleDefaultConfigs();

}
