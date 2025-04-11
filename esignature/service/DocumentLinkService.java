package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.payload.request.DocumentAccessUrlDto;
import com.skapp.enterprise.esignature.payload.response.DocumentLinkResponseDto;

public interface DocumentLinkService {

	DocumentLinkResponseDto generateDocumentAccessUrl(DocumentAccessUrlDto documentAccessUrlDto);

	DocumentLink setDocumentAccessUrlProperties(DocumentLink documentLink);

	ResponseEntityDto getRecipientDocumentData(Long documentId, Long recipientId);

}
