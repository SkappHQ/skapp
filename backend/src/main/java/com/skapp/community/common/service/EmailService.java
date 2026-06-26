package com.skapp.community.common.service;

import com.skapp.community.common.payload.request.TestEmailServerRequestDto;
import com.skapp.community.common.type.EmailTemplates;

public interface EmailService {

	void testEmailServer(TestEmailServerRequestDto testEmailServerRequestDto);

	void sendEmail(EmailTemplates emailTemplate, Object dynamicFeildsObject, String recipient);

	void sendEmail(EmailTemplates emailMainTemplate, EmailTemplates emailTemplate, Object dynamicFeildsObject,
			String recipient);

}
