package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ValidationException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.payload.request.AmazonS3SignedUrlValidatedRequestDto;
import com.skapp.enterprise.common.service.AmazonS3FileValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AmazonS3FileValidationServiceImpl implements AmazonS3FileValidationService {

	private static final Long CUSTOMER_DOCUMENT_MAX_SIZE_BYTES = (long) (25 * 1024 * 1024);

	private static final String CUSTOMER_DOCUMENT_ALLOWED_FILE_TYPE = "pdf";

	@Override
	public void validateS3FileUpload(AmazonS3SignedUrlValidatedRequestDto amazonS3SignedUrlValidatedRequestDto) {

		String fileType = amazonS3SignedUrlValidatedRequestDto.getFileType();
		String trimmedFileType = fileType != null
				? fileType.substring(fileType.lastIndexOf('/') + 1).trim().toLowerCase() : "";

		Long fileSize = amazonS3SignedUrlValidatedRequestDto.getFileSize();

		if (!CUSTOMER_DOCUMENT_ALLOWED_FILE_TYPE.equalsIgnoreCase(trimmedFileType)) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_FILE_TYPE);
		}

		if (fileSize > CUSTOMER_DOCUMENT_MAX_SIZE_BYTES) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_FILE_SIZE_EXCEEDED);
		}
	}

}
