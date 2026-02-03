package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.service.AsyncEmailSender;
import com.skapp.enterprise.common.service.EpAsyncEmailSender;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Local development email sender that routes all emails to a local SMTP server (e.g.
 * Mailpit). Activated only when the "local-mail" Spring profile is active. Overrides the
 * SendGrid-based EpAsyncEmailSenderImpl.
 */
@Service
@Profile("local-mail")
@Primary
@Slf4j
public class LocalSmtpEmailSenderImpl implements AsyncEmailSender, EpAsyncEmailSender {

	@Value("${local.mail.host:localhost}")
	private String mailHost;

	@Value("${local.mail.port:1025}")
	private int mailPort;

	@Value("${local.mail.from:noreply@skapp.local}")
	private String fromAddress;

	@Override
	public void sendMail(String to, String subject, String htmlBody, Map<String, String> placeholders) {
		doSend(to, subject, htmlBody, null, null, null, null);
	}

	@Override
	public void sendMailWithAttachment(String to, String subject, String htmlBody, Map<String, String> placeholders,
			byte[] attachmentData, String attachmentName, String attachmentContentType, List<String> ccEmails) {
		doSend(to, subject, htmlBody, attachmentData, attachmentName, attachmentContentType, ccEmails);
	}

	@Override
	public String getSendGridEmailBatchId() {
		log.info("[LocalSmtp] getSendGridEmailBatchId called — returning dummy batch ID");
		return "local-batch-" + System.currentTimeMillis();
	}

	@Override
	public void cancelScheduledEmails(String batchId, String status) {
		log.info("[LocalSmtp] cancelScheduledEmails called — batchId={}, status={} (no-op)", batchId, status);
	}

	private void doSend(String to, String subject, String htmlBody, byte[] attachmentData, String attachmentName,
			String attachmentContentType, List<String> ccEmails) {
		try {
			JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
			mailSender.setHost(mailHost);
			mailSender.setPort(mailPort);

			MimeMessage mimeMessage = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
			helper.setFrom(fromAddress);
			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(htmlBody, true);

			if (ccEmails != null) {
				for (String cc : ccEmails) {
					helper.addCc(cc);
				}
			}

			if (attachmentData != null && attachmentName != null) {
				helper.addAttachment(attachmentName,
						new jakarta.mail.util.ByteArrayDataSource(attachmentData, attachmentContentType));
			}

			mailSender.send(mimeMessage);
			log.info("[LocalSmtp] Email sent to {} — subject: {}", to, subject);
		}
		catch (MessagingException e) {
			log.error("[LocalSmtp] Failed to send email to {}: {}", to, e.getMessage());
		}
	}

}
