package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.request.DocumentAccessUrlDto;
import com.skapp.enterprise.esignature.payload.request.ResendAccessUrlDto;
import com.skapp.enterprise.esignature.payload.response.DocumentLinkResponseDto;
import com.skapp.enterprise.esignature.type.DocumentPermissionType;

public interface DocumentLinkService {

	DocumentLinkResponseDto generateDocumentAccessUrl(DocumentAccessUrlDto documentAccessUrlDto);

	void validatePermissionForGenerateAccessUrl(Envelope envelope, Recipient recipient,
			DocumentPermissionType requestedPermission);

	void resendDocumentAccessURL(ResendAccessUrlDto resendAccessUrlDto);

	DocumentLinkData createDocumentLinkData(DocumentAccessUrlDto documentAccessUrlDto, Recipient recipient,
			Document document, Envelope envelope);

	ResponseEntityDto getRecipientDocumentData(Long documentId, Long recipientId, boolean isDocAccess);

	String getDocumentAccessUrlForNudge(Envelope envelope, Recipient recipient);

	DocumentLink getDocumentLinkFromToken();

	void validateTokenFlows(boolean isDocAccess, Recipient recipient, Long documentId);

	ResponseEntityDto getTokenFromUuid(String uuid, String state);

	ResponseEntityDto getTokenResendStatus(String token);

	ResponseEntityDto sendOtpFromUuid(String uuid, String state);

	ResponseEntityDto sendOtpFromDocumentAndRecipientId(Long documentId, Long recipientId);

	ResponseEntityDto verifyOtpAndCreateTokenFromUuid(String uuid, String state, String code);

	ResponseEntityDto verifyOtpFromDocumentAndRecipientId(Long documentId, Long recipientId, String code, boolean b);

	ResponseEntityDto resendOtpFromUuid(String uuid, String state);

	ResponseEntityDto resendOtpFromDocumentAndRecipientId(Long documentId, Long recipientId);

	ResponseEntityDto getRecipientDocumentVerificationData(Long documentId, Long recipientId, boolean b);

	record DocumentLinkData(DocumentLink documentLink, String accessUrl) {
	}

}
