package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.enterprise.esignature.payload.email.EnvelopRecipientEmailDynamicFields;
import com.skapp.enterprise.esignature.payload.response.DocumentDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.EnvelopeDetailedResponseDto;
import com.skapp.enterprise.esignature.service.EnvelopRecipientEmailService;
import com.skapp.enterprise.esignature.type.MemberRole;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EnvelopRecipientEmailServiceImpl implements EnvelopRecipientEmailService {

	@NonNull
	private final EmailService emailService;

	private final UserService userService;

	@Override
	public void sendEnvelopToRecipientEmail(String userName, String userEmail, String memberRole,
			EnvelopeDetailedResponseDto envelopeDetailedResponseDto) {

		EnvelopRecipientEmailDynamicFields envelopRecipientEmailDynamicFields = new EnvelopRecipientEmailDynamicFields();
		envelopRecipientEmailDynamicFields.setEmployeeOrManagerName(userName);
		envelopRecipientEmailDynamicFields.setEnvelopId(envelopeDetailedResponseDto.getId());
		envelopRecipientEmailDynamicFields.setEnvelopeSubject(envelopeDetailedResponseDto.getSubject());
		envelopRecipientEmailDynamicFields.setEnvelopeMessage(envelopeDetailedResponseDto.getMessage());
		envelopRecipientEmailDynamicFields.setSender(userService.getCurrentUser().getEmployee().getFirstName() + " "
				+ userService.getCurrentUser().getEmployee().getLastName());
		envelopRecipientEmailDynamicFields.setSenderEmail(userService.getCurrentUser().getEmail());

		String documentName = null;

		for (DocumentDetailResponseDto documentResponseDto : envelopeDetailedResponseDto.getDocuments()) {
			if (documentName == null) {
				documentName = documentResponseDto.getName();
			}
			else {
				documentName = documentName.concat(" & ").concat(documentResponseDto.getName());
			}
		}

		envelopRecipientEmailDynamicFields.setDocumentNames(documentName);

		if ((MemberRole.CC).toString().equalsIgnoreCase(memberRole)
				|| (MemberRole.VIEWER).toString().equalsIgnoreCase(memberRole)) {
			emailService.sendEmail(EmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_RECIEVER_EMAIL,
					envelopRecipientEmailDynamicFields, userEmail);
		}
		else {
			emailService.sendEmail(EmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_SIGNER_EMAIL,
					envelopRecipientEmailDynamicFields, userEmail);
		}
	}

}
