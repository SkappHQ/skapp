package com.skapp.enterprise.common.service.impl;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.TooManyRequestsException;
import com.skapp.community.common.service.AsyncEmailSender;
import com.skapp.enterprise.common.constant.EpApiUriConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Primary
public class EpAsyncEmailSenderImpl implements AsyncEmailSender {

	@Value("${sendgrid.api.key}")
	private String sendGridApiKey;

	@Value("${organization.email}")
	private String organizationEmail;

	@Override
	public void sendMail(String to, String subject, String htmlBody, Map<String, String> placeholders) {
		try {
			Email from = new Email(organizationEmail);
			Email toEmail = new Email(to);
			Content content = new Content("text/html", htmlBody);

			Mail mail = new Mail();
			mail.setFrom(from);
			mail.setSubject(subject);
			mail.addContent(content);

			Personalization personalization = new Personalization();
			personalization.addTo(toEmail);
			mail.addPersonalization(personalization);

			SendGrid sendGrid = new SendGrid(sendGridApiKey);
			Request request = new Request();
			request.setMethod(Method.POST);
			request.setEndpoint(EpApiUriConstants.SENDGRID_POST_API);
			request.setBody(mail.build());

			log.info("SendGrid Request Body: {}", request.getBody());

			Response response = sendGrid.api(request);

			if (response.getStatusCode() == 429) {
				throw new TooManyRequestsException(CommonMessageConstant.COMMON_ERROR_TOO_MANY_REQUESTS_EXCEPTION);
			}

			log.info("Email sent to {} from {} with status: {}", to, organizationEmail, response.getStatusCode());
		}
		catch (IOException e) {
			log.error("Error sending email: {}", e.getMessage());
		}
	}

}
