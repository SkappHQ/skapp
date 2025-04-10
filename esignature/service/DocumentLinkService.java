package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.DocumentAccessUrlDto;
import com.skapp.enterprise.esignature.payload.response.TemporaryLinkResponseDto;

public interface DocumentLinkService {

	TemporaryLinkResponseDto generateDocumentAccessUrl(DocumentAccessUrlDto documentAccessUrlDto);

	Boolean isDocumentAccessUrlExpired(String token);

	ResponseEntityDto getRecipientDocumentData(Long documentId, Long recipientId);

}
