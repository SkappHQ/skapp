package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.enterprise.common.payload.request.AmazonS3DeleteItemRequestDto;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.common.type.Tier;
import com.skapp.enterprise.esignature.constant.EsignConstants;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignTemplateMapper;
import com.skapp.enterprise.esignature.model.TemplateDocument;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.EditDocumentDto;
import com.skapp.enterprise.esignature.payload.response.template.DocumentTemplateDetailResponseDto;
import com.skapp.enterprise.esignature.repository.TemplateDocumentDao;
import com.skapp.enterprise.esignature.service.TemplateDocumentService;
import com.skapp.enterprise.esignature.util.EsignUtil;
import com.skapp.enterprise.people.service.EpUserService;
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

	private final UserService userService;

	private final EpUserService epUserService;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	private static final String TEMPLATE_DOCUMENT_FILE_PATH_PREFIX = "/eSign/template/";

	@Override
	public ResponseEntityDto saveDocumentTemplate(DocumentDto documentDto) {

		Tier tier = epUserService.getCurrentUserTier();

		if (!tier.equals(Tier.PRO)) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_TEMPLATES_FEATURE_NOT_AVAILABLE_FOR_CURRENT_TIER);
		}

		TemplateDocument templateDocument = esignTemplateMapper.documentDtoToTemplateDocument(documentDto);
		templateDocument.setFilePath(bucketName + "/" + templateDocument.getFilePath());

		TemplateDocument savedTemplateDocument = templateDocumentDao.save(templateDocument);

		DocumentTemplateDetailResponseDto responseDto = esignTemplateMapper
			.templateDocumentToDocumentTemplateDetailResponseDto(savedTemplateDocument);

		return new ResponseEntityDto(false, responseDto);

	}

	@Override
	public ResponseEntityDto editDocumentTemplate(Long id, EditDocumentDto editDocumentDto) {

		User currentUser = userService.getCurrentUser();

		TemplateDocument templateDocument = templateDocumentDao.findById(id)
			.orElseThrow(
					() -> new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_TEMPLATE_NOT_FOUND));

		boolean isSuperAdminOrEsignAdmin = EsignUtil.validateEsignRoleAsSuperAdminOrEsignAdmin(currentUser);

		if (!isSuperAdminOrEsignAdmin
				&& !templateDocument.getTemplateEnvelope().getOwner().getUserId().equals(currentUser.getUserId())) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_DOCUMENT_TEMPLATE_MODIFICATION_AND_DELETION_ACCESS_DENIED);
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

		User currentUser = userService.getCurrentUser();

		TemplateDocument templateDocument = templateDocumentDao.findById(id)
			.orElseThrow(
					() -> new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_TEMPLATE_NOT_FOUND));

		boolean isSuperAdminOrEsignAdmin = EsignUtil.validateEsignRoleAsSuperAdminOrEsignAdmin(currentUser);

		if (!isSuperAdminOrEsignAdmin
				&& !templateDocument.getTemplateEnvelope().getOwner().getUserId().equals(currentUser.getUserId())) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_DOCUMENT_TEMPLATE_MODIFICATION_AND_DELETION_ACCESS_DENIED);
		}

		ResponseEntityDto s3Response = deleteDocumentTemplateFromS3(templateDocument.getFilePath());

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

	@Override
	public ResponseEntityDto deleteDocumentTemplateFromS3(String filePath) {

		if (!filePath.contains(TEMPLATE_DOCUMENT_FILE_PATH_PREFIX)) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_DOCUMENT_TEMPLATE_DELETION_DENIED_INVALID_FILE_PATH);
		}

		AmazonS3DeleteItemRequestDto amazonS3DeleteItemRequestDto = new AmazonS3DeleteItemRequestDto();
		amazonS3DeleteItemRequestDto.setFolderPath(bucketName + "/" + filePath);

		return amazonS3Service.deleteFileFromS3(amazonS3DeleteItemRequestDto);
	}

}
