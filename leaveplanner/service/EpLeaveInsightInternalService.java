package com.skapp.enterprise.leaveplanner.service;

import com.skapp.enterprise.leaveplanner.payload.response.EpLeaveInsightContextResponseDto;

import java.util.List;

public interface EpLeaveInsightInternalService {

	EpLeaveInsightContextResponseDto getLeaveInsightContext(List<Long> employeeIds, int warningWindowDays,
			int capacityDropThresholdPct);

}
