package com.skapp.enterprise.common.service;

public interface AiSchedulerService {

	void triggerAiInsightsSchedule(String tenantId);

	void deleteAiInsightsSchedule(String tenantId);

}
