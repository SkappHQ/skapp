package com.skapp.enterprise.common.service;

import com.skapp.community.common.type.EmailTemplates;

import java.util.List;

public interface EpEmailService {

	String obtainSendGridBatchId();

	void cancelScheduledEmail(String batchId, String status);

	void sendEmailWithAttachment(EmailTemplates emailMainTemplate, EmailTemplates emailTemplate,
			Object dynamicFeildObject, String recipient, byte[] attachmentData, String attachmentName,
			String attachmentContentType, List<String> ccEmails);

}
