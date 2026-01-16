package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.enterprise.common.payload.request.AmazonS3DeleteItemRequestDto;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.esignature.constant.EsignConstants;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignTemplateMapper;
import com.skapp.enterprise.esignature.model.TemplateDocument;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.EditDocumentDto;
import com.skapp.enterprise.esignature.payload.response.template.DocumentTemplateDetailResponseDto;
import com.skapp.enterprise.esignature.repository.TemplateDocumentDao;
import com.skapp.enterprise.esignature.service.TemplateDocumentService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TemplateDocumentServiceImpl implements TemplateDocumentService {

	private final TemplateDocumentDao templateDocumentDao;

	private final EsignTemplateMapper esignTemplateMapper;

	private final AmazonS3Service amazonS3Service;

	private final MessageUtil messageUtil;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	@Override
	public ResponseEntityDto saveDocumentTemplate(DocumentDto documentDto) {

		TemplateDocument templateDocument = esignTemplateMapper.documentDtoToTemplateDocument(documentDto);
		templateDocument.setFilePath(bucketName + "/" + templateDocument.getFilePath());

		TemplateDocument savedTemplateDocument = templateDocumentDao.save(templateDocument);

		DocumentTemplateDetailResponseDto responseDto = esignTemplateMapper
			.templateDocumentToDocumentTemplateDetailResponseDto(savedTemplateDocument);

		return new ResponseEntityDto(false, responseDto);

	}

	@Override
	public ResponseEntityDto editDocumentTemplate(Long id, EditDocumentDto editDocumentDto) {

		TemplateDocument templateDocument = templateDocumentDao.findById(id)
			.orElseThrow(
					() -> new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_TEMPLATE_NOT_FOUND));

		if (templateDocument.getTemplateEnvelope() != null) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_DOCUMENT_TEMPLATE_ALREADY_ASSOCIATED_WITH_ENVELOPE_TEMPLATE);
		}

		if (editDocumentDto.getName() != null) {
			templateDocument.setName(editDocumentDto.getName());
		}
		if (editDocumentDto.getFilePath() != null) {
			templateDocument.setFilePath(bucketName + "/" + editDocumentDto.getFilePath());
		}

		TemplateDocument savedDocumentTemplate = templateDocumentDao.save(templateDocument);

		DocumentTemplateDetailResponseDto responseDto = esignTemplateMapper
			.templateDocumentToDocumentTemplateDetailResponseDto(savedDocumentTemplate);

		return new ResponseEntityDto(false, responseDto);

	}

	@Override
	public ResponseEntityDto deleteDocumentTemplate(Long id) {

		TemplateDocument templateDocument = templateDocumentDao.findById(id)
			.orElseThrow(
					() -> new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_TEMPLATE_NOT_FOUND));

		if (templateDocument.getTemplateEnvelope() != null) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_DOCUMENT_TEMPLATE_ALREADY_ASSOCIATED_WITH_ENVELOPE_TEMPLATE);
		}

		AmazonS3DeleteItemRequestDto amazonS3DeleteItemRequestDto = new AmazonS3DeleteItemRequestDto();
		amazonS3DeleteItemRequestDto.setFolderPath(bucketName + "/" + templateDocument.getFilePath());

		ResponseEntityDto s3Response = amazonS3Service.deleteFileFromS3(amazonS3DeleteItemRequestDto);

		if (s3Response.getStatus().equalsIgnoreCase(EsignConstants.SUCCESSFUL)) {

			templateDocumentDao.delete(templateDocument);

			return new ResponseEntityDto(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_SUCCESS_DOCUMENT_TEMPLATE_DELETED), false);
		}
		else {
			return new ResponseEntityDto(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_TEMPLATE_DELETION_FAILED), true);
		}

	}

}
