package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentCreateRequestDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentFilterDto;

public interface CustomerDocumentService {

    ResponseEntityDto saveDocument(CustomerDocumentCreateRequestDto requestDto);

    ResponseEntityDto getDocumentById(Long id);

    ResponseEntityDto filterDocuments(CustomerDocumentFilterDto filterDto);

    ResponseEntityDto deleteDocumentById(Long id);

}
