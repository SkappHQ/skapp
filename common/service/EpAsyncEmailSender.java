package com.skapp.enterprise.common.service;

public interface EpAsyncEmailSender {

	String getSendGridEmailBatchId();

	void cancelScheduledEmails(String batchId, String status);

}
