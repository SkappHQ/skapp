package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentCreateRequestDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentFilterDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentRenameRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;

public interface CustomerDocumentService {

	ResponseEntityDto createDocument(CustomerDocumentCreateRequestDto requestDto);

	ResponseEntityDto getDocumentById(Long id);

	ResponseEntityDto filterDocuments(CustomerDocumentFilterDto filterDto);

	ResponseEntity<?> downloadDocument(Long id);

	ResponseEntityDto renameDocument(@Valid CustomerDocumentRenameRequestDto customerDocumentRenameRequestDto);

	ResponseEntityDto deleteDocument(Long id);

}
