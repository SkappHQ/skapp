package com.skapp.enterprise.common.service;

public interface EpEmailService {

	String obtainSendGridBatchId();

	void cancelScheduledEmail(String batchId, String status);

}
