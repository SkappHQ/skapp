package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.response.DocumentDetailResponseDto;
import com.skapp.enterprise.esignature.repository.DocumentRepository;
import com.skapp.enterprise.esignature.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

	private final DocumentRepository documentRepository;

	private final EsignMapper eSignMapper;

	@Override
	public ResponseEntityDto saveDocument(DocumentDto documentDto) {
		Document document = eSignMapper.documentDtoToDocument(documentDto);
		document = documentRepository.save(document);
		DocumentDetailResponseDto documentResponseDto = eSignMapper.documentToDocumentDetailDto(document);
		return new ResponseEntityDto(false, documentResponseDto);
	}

}
