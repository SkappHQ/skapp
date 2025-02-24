package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;

public interface DocumentService {

	ResponseEntityDto saveDocument(DocumentDto document);

}
