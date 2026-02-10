package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.service.NotificationService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.NotificationCategory;
import com.skapp.community.common.type.NotificationType;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.email.EsignEmailDynamicFields;
import com.skapp.enterprise.esignature.service.EsignNotificationService;
import com.skapp.enterprise.esignature.util.EsignUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EsignNotificationServiceImpl implements EsignNotificationService {

	private final NotificationService notificationService;

	@Override
	public void notifyEnvelopeOwnerOnDocumentCompleted(Envelope envelope, Recipient recipient) {
		if (envelope.getOwner() == null || envelope.getOwner().getInternalUser() == null
				|| envelope.getOwner().getInternalUser().getEmployee() == null) {
			return;
		}

		String documentName = EsignUtil.truncateDocumentName(envelope.getDocuments().getFirst().getName());
		
		EsignEmailDynamicFields esignEmailDynamicFields = new EsignEmailDynamicFields();
		esignEmailDynamicFields.setDocumentName(documentName);
		esignEmailDynamicFields.setRecipientName(recipient.getAddressBook().getName());

		notificationService.createNotification(envelope.getOwner().getInternalUser().getEmployee(),
				String.valueOf(envelope.getId()), NotificationType.ESIGN_DOCUMENT_COMPLETED,
				EmailBodyTemplates.ESIGN_DOCUMENT_COMPLETED, esignEmailDynamicFields, NotificationCategory.ESIGN);

		log.info("Created in-app notification for envelope owner on document completion. Envelope ID: {}, Recipient: {}",
				envelope.getId(), recipient.getAddressBook().getName());
	}

	@Override
	public void notifyRecipientOnSignRequest(Recipient recipient, String documentId, String envelopeId) {
		if (recipient.getMemberRole().equals(com.skapp.enterprise.esignature.type.MemberRole.CC) 
				|| recipient.getAddressBook() == null 
				|| recipient.getAddressBook().getInternalUser() == null 
				|| recipient.getAddressBook().getInternalUser().getEmployee() == null) {
			return;
		}

		String documentName = EsignUtil.truncateDocumentName(
				recipient.getEnvelope().getDocuments().getFirst().getName());
		
		EsignEmailDynamicFields esignEmailDynamicFields = new EsignEmailDynamicFields();
		esignEmailDynamicFields.setDocumentName(documentName);
		
		String resourceId = envelopeId + "," + documentId + "," + recipient.getId();
		
		notificationService.createNotification(
				recipient.getAddressBook().getInternalUser().getEmployee(),
				resourceId,
				NotificationType.ESIGN_DOCUMENT_SIGN_REQUEST,
				EmailBodyTemplates.ESIGN_DOCUMENT_SIGN_REQUEST,
				esignEmailDynamicFields,
				NotificationCategory.ESIGN
		);
		
		log.info("Created sign request notification for recipient ID: {} for document ID: {}", 
				recipient.getId(), documentId);
	}

	@Override
	public void notifyRecipientOnReminder(Recipient recipient) {
		if (recipient.getAddressBook() == null 
				|| recipient.getAddressBook().getInternalUser() == null 
				|| recipient.getAddressBook().getInternalUser().getEmployee() == null) {
			return;
		}

		String documentName = EsignUtil.truncateDocumentName(
				recipient.getEnvelope().getDocuments().getFirst().getName());
		
		EsignEmailDynamicFields esignEmailDynamicFields = new EsignEmailDynamicFields();
		esignEmailDynamicFields.setDocumentName(documentName);
		
		String resourceId = recipient.getEnvelope().getId() + "," 
				+ recipient.getEnvelope().getDocuments().getFirst().getId() + "," 
				+ recipient.getId();

		notificationService.createNotification(
				recipient.getAddressBook().getInternalUser().getEmployee(),
				resourceId,
				NotificationType.ESIGN_DOCUMENT_REMINDER,
				EmailBodyTemplates.ESIGN_DOCUMENT_REMINDER,
				esignEmailDynamicFields,
				NotificationCategory.ESIGN
		);
		
		log.info("Created reminder notification for recipient ID: {}", recipient.getId());
	}

}
