package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.DocumentFieldSignDto;
import com.skapp.enterprise.esignature.payload.request.DocumentSignDto;
import com.skapp.enterprise.esignature.payload.request.EditDocumentDto;

public interface DocumentService {

	ResponseEntityDto saveDocument(DocumentDto document);

	Document getDocumentById(Long id);

	DocumentVersion signFirstVersionDocument(DocumentSignDto documentSignDto);

	ResponseEntityDto sequentialSignDocument(DocumentSignDto documentSignDto);

	ResponseEntityDto parallelSignDocument(DocumentSignDto documentSignDto);

	ResponseEntityDto signField(DocumentFieldSignDto documentFieldSignDto);

	ResponseEntityDto editDocument(Long id, EditDocumentDto editDocumentDto);

	ResponseEntityDto deleteDocument(Long id);

}
