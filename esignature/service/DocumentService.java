package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.DocumentFieldSignDto;
import com.skapp.enterprise.esignature.payload.request.DocumentSignDto;

public interface DocumentService {

	ResponseEntityDto saveDocument(DocumentDto document);

	DocumentVersion signFirstVersionDocument(DocumentSignDto documentSignDto);

	ResponseEntityDto sequentialSignDocument(DocumentSignDto documentSignDto);

	ResponseEntityDto sequentialSignField(DocumentFieldSignDto documentFieldSignDto);

}
