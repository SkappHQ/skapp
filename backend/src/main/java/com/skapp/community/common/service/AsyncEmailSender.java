package com.skapp.community.common.service;

import java.util.Map;

public interface AsyncEmailSender {

	void sendMail(String to, String subject, String htmlBody, Map<String, String> placeholders);

}
