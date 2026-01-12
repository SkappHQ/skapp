package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.EditDocumentDto;

public interface DocumentTemplateService {

	ResponseEntityDto saveDocumentTemplate(DocumentDto documentDto);

	ResponseEntityDto editDocumentTemplate(Long id, EditDocumentDto editDocumentDto);

	ResponseEntityDto deleteDocumentTemplate(Long id);

}
