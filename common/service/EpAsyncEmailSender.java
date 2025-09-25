package com.skapp.enterprise.common.service;

import java.util.List;
import java.util.Map;

public interface EpAsyncEmailSender {

	String getSendGridEmailBatchId();

	void cancelScheduledEmails(String batchId, String status);

	void sendMailWithAttachment(String to, String subject, String htmlBody, Map<String, String> placeholders,
			byte[] attachmentData, String attachmentName, String attachmentContentType, List<String> ccEmails);

}
