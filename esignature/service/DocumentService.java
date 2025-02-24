package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.DocumentSignDto;
import org.springframework.transaction.annotation.Transactional;

public interface DocumentService {

	ResponseEntityDto saveDocument(DocumentDto document);

	@Transactional
	DocumentVersion signFirstVersionDocument(DocumentSignDto documentSignDto);

	ResponseEntityDto signDocument(DocumentSignDto documentSignDto);

}
